const db = require("../config/conn");
const { formattedQueryLog } = require("../utils/common");
const { generateHashPassword } = require("../utils/userHelper");


class Company {
  static async create(schemaName , companyData) {
    try {
      const hasEmail = !!companyData.email;
      const hasMobile = !!companyData.mobile;
      const hasCountrycode = !!companyData.countrycode;

      const email = hasEmail ? companyData.email : null;
      const mobile = hasMobile ? companyData.mobile : null;
      const countrycode = hasCountrycode ? companyData.countrycode : null;

      let hashedPassword = await generateHashPassword(companyData.password);
      hashedPassword = hashedPassword.toString();

      const query = `
        INSERT INTO ${schemaName}.company(
          companyname, emailid, countrycode, contactno, password, isverified, entrytime, updatetime, status)
        VALUES ($1, $2, $3, $4, $5, $6::integer, NOW(), NOW(), 1)
        RETURNING emailid;
      `;

      const values = [
        companyData.companyname,
        email,
        countrycode,
        mobile,
        hashedPassword,
        1,
      ];

      formattedQueryLog(query, values);
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  static async findByMobile(schemaName , mobile) {
    try {
      const query = `SELECT * FROM ${schemaName}.company WHERE contactno = $1`;
      const result = await db.query(query, [mobile]);
      console.log(result);
      return result.rows[0];
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  static async findByEmail(schemaName , email) {
    try {
      const query = `SELECT * FROM ${schemaName}.company WHERE emailid = $1`;
      const result = await db.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  static async findByEmailAndMobile(schemaName , mobile, email) {
    try {
      const query = `
        SELECT * FROM ${schemaName}.company 
        WHERE contactno = $1 OR emailid = $2
      `;
      const result = await db.query(query, [mobile, email]);
      return result.rows[0];
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  static async updatePassword(schemaName , password, companyData) {
    const hasEmail = !!companyData.emailid;
    const hasMobile = !!companyData.contactno;

    const email = hasEmail ? companyData.emailid : null;
    const mobile = hasMobile ? companyData.contactno : null;

    let hashedPassword = await generateHashPassword(companyData.password);
    hashedPassword = hashedPassword.toString();

    try {
      const hashedPassword = await generateHashPassword(password);
      const query = `
        UPDATE ${schemaName}.company
        SET password = $1, updatetime = NOW()
        WHERE ${hasEmail ? "emailid = $2" : "contactno = $2::numeric"}
        RETURNING *;
      `;
      const values = [hashedPassword, hasEmail ? email : mobile];
      const result = await db.query(query, values);
      if (result.rows.length === 0) {
        return null; // Not found
      }
      return result.rows[0];
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}

module.exports = Company;
