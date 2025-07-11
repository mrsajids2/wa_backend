const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const csv = require("csv-parser");
const { insertManyContacts } = require("../respository/contact.repository");

exports.uploadContactswithExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const filePath = req.file.path;
    const ext = path.extname(filePath).toLowerCase();
    const allowedExt = [".csv", ".xls", ".xlsx"];

    if (!allowedExt.includes(ext)) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: "Unsupported file type." });
    }

    let contacts = [];
    if (ext === ".csv") {
      contacts = await parseCSV(filePath);
    } else {
      contacts = parseExcel(filePath);
    }

    fs.unlinkSync(filePath); // remove file after parsing
    console.log("Parsed contacts:", contacts);
    

    await insertManyContacts(contacts);

    return res.status(200).json({
      message: "Contacts uploaded and saved to database.",
      count: contacts.length,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
}

function parseExcel(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(worksheet);
}
