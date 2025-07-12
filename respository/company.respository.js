const db = require("../config/conn");
const { formattedQueryLog } = require("../utils/common");
const { generateHashPassword } = require("../utils/userHelper");

class Company {
  static async create(companyData) {
    try {
      // Decide which field to use
      const hasEmail = !!companyData.email;
      const hasMobile = !!companyData.mobile;
      const hasCountrycode = !!companyData.countrycode;

      // Only one of email or mobile is filled; the other is null
      const email = hasEmail ? companyData.email : null;
      const mobile = hasMobile ? companyData.mobile : null;
      const countrycode = hasCountrycode ? companyData.countrycode : null;

      let hashedPassword = await generateHashPassword(companyData.password);
      hashedPassword = hashedPassword.toString();

      const query = `
      INSERT INTO masters.company(
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

  static async findByMobile(mobile) {
    try {
      const query = "SELECT * FROM masters.company";
      const result = await db.query(query, []);
      console.log(result);
      return result.rows[0];
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  static async findByEmail(email) {
    try {
      const query = "SELECT * FROM masters.company WHERE emailid = $1";
      const result = await db.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  static async findByEmailAndMobile(mobile, email) {
    try {
      const query = `
        SELECT * FROM masters.company 
        WHERE contactno = $1 OR emailid = $2
      `;
      const result = await db.query(query, [mobile, email]);
      return result.rows[0];
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  static async updateOtpStatus(status, password, identifier) {
    try {
      const isEmail =
        typeof identifier === "string" && identifier.includes("@");
      const hashedPassword = await generateHashPassword(password);
      const query = `
        UPDATE masters.company
        SET status = $1::integer, password = $2, updatetime = NOW()
        WHERE ${isEmail ? "emailid = $3" : "contactno = $3::numeric"}
        RETURNING *;
      `;
      const values = [status, hashedPassword.toString(), identifier];
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
  static async updatePassword(password, companyData) {
    const hasEmail = !!companyData.emailid;
    const hasMobile = !!companyData.contactno;

    // Only one of email or mobile is filled; the other is null
    const email = hasEmail ? companyData.emailid : null;
    const mobile = hasMobile ? companyData.contactno : null;

    let hashedPassword = await generateHashPassword(companyData.password);
    hashedPassword = hashedPassword.toString();

    try {
      const hashedPassword = await generateHashPassword(password);
      const query = `
          UPDATE masters.company
          SET password = $1, updatetime = NOW()
          WHERE ${hasEmail ? "emailid = $2" : "contactno = $2::numeric"}
          RETURNING *;
      `;
      const values = [hashedPassword,  hasEmail ? email : mobile];
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
