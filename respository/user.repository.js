
const pool = require("../config/conn");
const { formattedQueryLog } = require("../utils/common");

class UserRepository {
  static async deleteUsersByIds(schemaName, userids = []) {
    if (!Array.isArray(userids) || userids.length === 0) return { deleted: 0, notDeleted: 0, deletedIds: [], notDeletedIds: [] };
    // Use parameterized query for array
    const query = `DELETE FROM ${schemaName}.users WHERE userid = ANY($1::uuid[]) RETURNING userid`;
    const result = await pool.query(query, [userids]);
    const deletedIds = result.rows.map(r => r.userid);
    const notDeletedIds = userids.filter(id => !deletedIds.includes(id));
    return {
      deletedCount: deletedIds.length,
      deleteFailedCount: notDeletedIds.length,
      deletedIds,
      notDeletedIds
    };
  }
  static async insertSingleContact(schemaName, companyId, user) {
    const query = `
      INSERT INTO ${schemaName}.users (
        companyid, username, mobileno, countrycode, emailid, usercategory, stateid, cityid, address, status, entrytime
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      RETURNING *
    `;

    const values = [
      companyId,
      user.username,
      user.mobileno,
      user.countrycode,
      user.email,
      user.usercategory,
      user.stateid,
      user.cityid,
      user.address,
      0,
    ];

    return (await pool.query(query, values)).rows[0];
  }

  static async insertManyContacts(schemaName, companyId, users) {
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
  }

  static async getAllContacts(
    schemaName,
    { filterConditions = {}, search = "", page = 1, pageSize = 10 } = {}
  ) {
    const values = [];
    const filters = [];
    console.log("search=", search);

    // Build filters from filterConditions
    for (const [key, value] of Object.entries(filterConditions)) {
      // Prefix ambiguous columns with um.
      let col = key;
      if (["stateid", "cityid", "username", "emailid", "mobileno", "address", "usercategory", "companyid", "userid"].includes(key)) {
        col = `um.${key}`;
      }
      filters.push(`${col} = $${values.length + 1}`);
      values.push(value);
    }

    // Add search filter
    if (search) {
      const searchableColumns = [
        "um.username",
        "um.emailid",
        "CAST(um.mobileno AS TEXT)",
        "um.address",
        "um.usercategory",
        "CAST(um.stateid AS TEXT)",
        "CAST(um.cityid AS TEXT)",
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
        SELECT um.*, sm.statename, cm.cityname, ROW_NUMBER() OVER (ORDER BY um.entrytime DESC) AS rowno
        FROM ${schemaName}.users um
        LEFT JOIN masters.state AS sm ON sm.stateid = um.stateid
        LEFT JOIN masters.city AS cm ON cm.cityid = um.cityid
        ${whereClause}
      ) AS sub
      ORDER BY entrytime DESC
      LIMIT $${values.length - 1} OFFSET $${values.length}
    `;
    // console.log(whereClause);

    // Count query
    const countQuery = `SELECT COUNT(*) FROM ${schemaName}.users um ${whereClause}`;
    const countValues = values.slice(0, -2);
formattedQueryLog(query,values)
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
  }

  static async checkUserExists(schemaName, mobileno, countrycode) {
    const query = `
      SELECT * FROM ${schemaName}.users
      WHERE
        (mobileno = $1 AND countrycode = $2)
      LIMIT 1
    `;
    const values = [mobileno, countrycode];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async deleteUserById(schemaName, id) {
    const query = `DELETE FROM ${schemaName}.users WHERE userid = $1 RETURNING *`;
    const result = await pool.query(query, [id]);
    return result.rows[0]; // returns deleted record or undefined
  }

  static async updateUserById(schemaName, userid, companyid, fieldsToUpdate) {
    // Remove companyid from fieldsToUpdate if present
    const updateFields = { ...fieldsToUpdate };
    delete updateFields.companyid;
    const keys = Object.keys(updateFields);
    if (keys.length === 0) return null;

    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = Object.values(updateFields);

    // Ensure both userid and companyid are matched in WHERE clause
    const query = `
      UPDATE ${schemaName}.users
      SET ${setClause}
      WHERE userid = $${keys.length + 1} AND companyid = $${keys.length + 2}
      RETURNING *
    `;

    values.push(userid, companyid); // add userid and companyid as last params
    const result = await pool.query(query, values);
    formattedQueryLog(query,values)
    return result.rows[0];
  }
}

module.exports = UserRepository;


