const pool = require("../config/conn");
const { formattedQueryLog } = require("../utils/common");

exports.insertContact = async (contact) => {
  const { name, email, phone } = contact;

  // Optional: skip incomplete rows
  if (!name || !email) return;

  await pool.query(
    `INSERT INTO contacts (name, email, phone)
     VALUES ($1, $2, $3)`,
    [name, email, phone || null]
  );
};

exports.insertManyContacts = async (schemaName, companyId, users) => {
  const client = await pool.connect();
  let successCount = 0;
  let failedCount = 0;
  try {
    await client.query("BEGIN");

    // Pre-fetch all unique states and cities from the input
    const uniqueStates = [
      ...new Set(
        users
          .map((u) => u.State && u.State.trim().toLowerCase())
          .filter(Boolean)
      ),
    ];
    const uniqueCities = [
      ...new Set(
        users.map((u) => u.City && u.City.trim().toLowerCase()).filter(Boolean)
      ),
    ];

    // Fetch all state IDs in one query
    let stateIdMap = {};
    if (uniqueStates.length > 0) {
      const stateRes = await client.query(
        `SELECT LOWER(statename) as statename, stateid FROM masters.state WHERE LOWER(statename) = ANY($1)`,
        [uniqueStates]
      );
      stateRes.rows.forEach((row) => {
        stateIdMap[row.statename] = row.stateid;
      });
    }

    // Fetch all city IDs in one query
    let cityIdMap = {};
    if (uniqueCities.length > 0) {
      const cityRes = await client.query(
        `SELECT LOWER(cityname) as cityname, cityid FROM masters.city WHERE LOWER(cityname) = ANY($1)`,
        [uniqueCities]
      );
      cityRes.rows.forEach((row) => {
        cityIdMap[row.cityname] = row.cityid;
      });
    }

    for (const user of users) {
      const {
        Name,
        Mobile,
        CountryCode,
        Email,
        State,
        City,
        Category,
        Address,
      } = user;

      // Skip incomplete rows
      // if (!Name || !Email) { failedCount++; continue; }

      // Use pre-fetched state/city IDs
      const stateId = State
        ? stateIdMap[State.trim().toLowerCase()] || null
        : null;
      const cityId = City ? cityIdMap[City.trim().toLowerCase()] || null : null;

      const query = `INSERT INTO ${schemaName}.users(
        companyid, username, mobileno, countrycode, emailid, usercategory, stateid, cityid, address, status, entrytime
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`;
      const values = [
        companyId,
        Name,
        Mobile ? parseFloat(Mobile) : null,
        CountryCode,
        Email ? Email : null,
        Category,
        stateId,
        cityId,
        Address,
        0,
      ];

      try {
        await client.query(query, values);
        // formattedQueryLog(query, values);
        successCount++;
      } catch (rowErr) {
        console.error("❌ Failed to insert user row:", rowErr.message, values);
        failedCount++;
      }
    }
    await client.query("COMMIT");
    return { successCount, failedCount };
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Failed to insert users:", err.message);
    throw err;
  } finally {
    client.release();
  }
};

// Get all contacts with search and pagination
// Get all contacts with search, pagination, and row number
exports.getAllContacts = async (
  schemaName,
  { filterConditions = {}, search = "", page = 1, pageSize = 10 } = {}
) => {
  const values = [];
  const filters = [];
  console.log("search=", search);

  // Build filters from filterConditions
  for (const [key, value] of Object.entries(filterConditions)) {
    filters.push(`${key} = $${values.length + 1}`);
    values.push(value);
  }

  // Add search filter
  if (search) {
    const searchableColumns = [
      "username",
      "emailid",
      "CAST(mobileno AS TEXT)",
      "address",
      "usercategory",
      "CAST(stateid AS TEXT)",
      "CAST(cityid AS TEXT)",
    ];
    const searchConditions = searchableColumns.map(
      (col, idx) => `${col} ILIKE $${values.length + idx + 1}`
    );
    filters.push(`(${searchConditions.join(" OR ")})`);
    searchableColumns.forEach(() => values.push(`%${search}%`));
  }

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const offset = (page - 1) * pageSize;
  values.push(pageSize, offset); // for LIMIT & OFFSET

  // Main query with row number
  const query = `
    SELECT * FROM (
      SELECT *, ROW_NUMBER() OVER (ORDER BY entrytime DESC) AS rowno
      FROM ${schemaName}.users
      ${whereClause}
    ) AS sub
    ORDER BY entrytime DESC
    LIMIT $${values.length - 1} OFFSET $${values.length}
  `;
  console.log(whereClause);

  // Count query
  const countQuery = `SELECT COUNT(*) FROM ${schemaName}.users ${whereClause}`;
  const countValues = values.slice(0, -2);

  // Execute queries
  const [countResult, result] = await Promise.all([
    pool.query(countQuery, countValues),
    pool.query(query, values),
  ]);
  formattedQueryLog(query, values);

  const total = parseInt(countResult.rows[0].count, 10);

  return {
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    contacts: result.rows, // includes rowno
  };
};
