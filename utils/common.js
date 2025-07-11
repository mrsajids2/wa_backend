const { default: axios } = require("axios");
const nodemailer = require("nodemailer");
const fs = require("fs");

const xlsx = require("xlsx");
const csv = require("csv-parser");
// pagination
exports.getOffset = (pageno, itemperpage) => {
  // Convert to integer or fallback to default
  let perPage = parseInt(itemperpage);
  perPage = isNaN(perPage) || perPage <= 0 ? 10 : perPage;
  let page = parseInt(pageno);
  page = isNaN(page) || page <= 0 ? 1 : page;
  const offset = (page - 1) * perPage;

  return [offset, perPage];
};

exports.generateOTP = () => {
  // Placeholder for OTP sending logic
  // This function can be implemented to send OTP via email or SMS
  // For example, using a third-party service like Twilio or SendGrid
  return new Promise((resolve, reject) => {
    // Simulate OTP sending
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit OTP
    resolve(otp);
  });
};

exports.checkEmailOrMobile = (input = "") => {
  input = input.trim();

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const mobileRegex = /^(\+?\d[\d\s-]{9,})$/;

  if (emailRegex.test(input)) return "EMAIL";

  const digitsOnly = input.replace(/\D/g, "");
  if (
    mobileRegex.test(input) &&
    digitsOnly.length >= 10 &&
    digitsOnly.length <= 15
  ) {
    return "MOBILE";
  }

  return "UNKNOWN";
};

exports.formattedQueryLog = (query, values) => {
  let formattedQuery = query;
  values.forEach((value, index) => {
    // Replace $1, $2, etc. (PostgreSQL style) or ? (MySQL style)
    formattedQuery = formattedQuery.replace(/\$\d+|\?/, `'${value}'`);
  });
  console.log("\x1b[34mExecuted Query:= %s\x1b[0m", formattedQuery);
  return formattedQuery;
};

exports.parseExcel = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(worksheet);
};

exports.parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
};
