const pool = require("../config/conn");

class TemplateRepository {
  static async createTemplate({
    templatename,
    templatelanguage,
    templatecontent,
    companyid,
    templatecategory,
    status,
  }) {
    const query = `INSERT INTO company.templates (templatename, templatelanguage, templatecontent, companyid, templatecategory, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`;
    const values = [
      templatename,
      templatelanguage,
      templatecontent,
      companyid,
      templatecategory,
      status,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async updateStatus(templateid, status) {
    const query = `UPDATE company.templates SET status = $1 WHERE templateid = $2 RETURNING *`;
    const result = await pool.query(query, [status, templateid]);
    return result.rows[0];
  }

  static async getTemplates(
    schemaName,
    { filters = {}, page = 1, pageSize = 10 } = {}
  ) {
    const values = [];
    const where = [];
    for (const [key, value] of Object.entries(filters)) {
      where.push(`${key} = $${values.length + 1}`);
      values.push(value);
    }
    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const offset = (page - 1) * pageSize;
    values.push(pageSize, offset);
    const query = `SELECT templateid, templatename, templatelanguage,templatecategory, templatecontent, (case when status = 0 then 'Pending'
          when status = 1 then 'Approved'
          when status = 2 then 'Rejected' end) as status FROM ${schemaName}.templates ${whereClause} ORDER BY created_at DESC LIMIT $${
      values.length - 1
    } OFFSET $${values.length}`;
    const countQuery = `SELECT COUNT(*) FROM ${schemaName}.templates ${whereClause}`;
    const countValues = values.slice(0, -2);
    const [countResult, result] = await Promise.all([
      pool.query(countQuery, countValues),
      pool.query(query, values),
    ]);
    return {
      total: parseInt(countResult.rows[0].count, 10),
      page,
      templates: result.rows,
    };
  }

  static async deleteTemplate(schemaName, templateid) {
    const query = `DELETE FROM ${schemaName}.templates WHERE templateid = $1 RETURNING *`;
    const result = await pool.query(query, [templateid]);
    return result.rows[0];
  }
}

module.exports = TemplateRepository;
