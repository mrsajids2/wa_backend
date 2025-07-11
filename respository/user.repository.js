const pool = require("../config/conn");

// Get all users with optional filter conditions
exports.getAllUsers = async (schemaName, filterConditions = {}) => {
  let query = `SELECT * FROM ${schemaName}.users`;
  const values = [];
  const filters = [];

  // Build filter conditions dynamically
  Object.entries(filterConditions).forEach(([key, value], idx) => {
    filters.push(`${key} = $${idx + 1}`);
    values.push(value);
  });

  if (filters.length > 0) {
    query += ` WHERE ${filters.join(" AND ")}`;
  }

  const result = await pool.query(query, values);
  return result.rows;
};

// Add more user-related repository functions as needed
