const pool = require('../config/conn'); 

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

exports.insertManyContacts = async (users) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const user of users) {
      const {
        companyId,
        username,
        mobileNo,
        emailId,
        address,
        status,
        entryTime
      } = user;

      // Skip incomplete rows
      if (!username || !emailId) continue;

      await client.query(
        `INSERT INTO company.users (
          companyid, username, mobileno, emailid, address, status, entrytime
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          0, // Assuming companyId is not used
          username,
          parseFloat(mobileNo),
          emailId,
          address,
          parseInt(status),
          entryTime || new Date()
        ]
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to insert users:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

