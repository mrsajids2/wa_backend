// const db = require('../config/dbconfig');
const pool = require("../config/conn");

exports.getAllStates = async () => {
  const result = await pool.query('SELECT stateid, statename FROM masters.state'); 
  return result.rows;
};

// exports.getStateById = async (id) => {
//   const result = await db.query('SELECT * FROM state_masters WHERE id = $1', [id]);
//   return result.rows[0];
// };

// exports.getAllCities = async () => {
//   const result = await db.query('SELECT * FROM city_masters ORDER BY name');
//   return result.rows;
// };

exports.getCitiesByStateId = async (stateId) => {
  const result = await pool.query('SELECT cityid,cityname FROM masters.city WHERE stateid = $1', [stateId]);
  return result.rows;
};
