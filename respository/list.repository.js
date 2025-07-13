const pool = require("../config/conn");

class ListRepository {
  static async getAllStates(schemaName) {
    const result = await pool.query(`SELECT stateid, statename FROM ${schemaName}.state ORDER BY statename ASC`);
    return result.rows;
  }

  static async getCitiesByStateId(schemaName, stateId) {
    const result = await pool.query(`SELECT cityid, cityname FROM ${schemaName}.city WHERE stateid = $1 ORDER BY cityname ASC`, [stateId]);
    return result.rows;
  }
}

module.exports = ListRepository;
