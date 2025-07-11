const pool = require("../config/conn");
const { formattedQueryLog } = require("../utils/common");

exports.insertContact = async (contact) => {
  const { name, email, phone } = contact;

  if (!name || !email) return;

  await pool.query(
    `INSERT INTO contacts (name, email, phone)
     VALUES ($1, $2, $3)`,
    [name, email, phone || null]
  );
};

exports.insertManyContacts = async (schemaName, companyId, users) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const user of users) {
      const { username, mobileNo, emailId, address, usercategory } = user;

      const query = `INSERT INTO ${schemaName}.users(
          companyid, username, mobileno, emailid, address, status, entrytime, usercategory
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)`;
      const values = [
        companyId,
        username,
        parseFloat(mobileNo),
        emailId,
        address,
        0,
        usercategory,
      ];

      await client.query(query, values);
      formattedQueryLog(query, values);
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};