const fs = require("fs");
const path = require("path");
const { insertManyContacts } = require("../respository/contact.repository");
const { parseCSV, parseExcel } = require("../utils/common");
const response = require("../utils/responseManager");

exports.uploadContacts = async (req, res) => {
  const { companyid } = req.body;
  if (!companyid) {
    return response.forbidden(res, "Companyid is required");
  }

  try {
    if (!req.file) {
      return response.badRequest(res, "No file uploaded.");
    }

    const filePath = req.file.path;
    const ext = path.extname(filePath).toLowerCase();
    const allowedExt = [".csv", ".xls", ".xlsx"];

    if (!allowedExt.includes(ext)) {
      fs.unlinkSync(filePath);
      return response.badRequest(res, "Invalid file type.");
    }

    let contacts = [];
    if (ext === ".csv") {
      contacts = await parseCSV(filePath);
    } else {
      contacts = parseExcel(filePath);
    }

    fs.unlinkSync(filePath);
    console.log("Parsed contacts:", contacts);

    await insertManyContacts("company", companyid, contacts);

    return response.success(res, 200, "Contacts uploaded successfully.", {
      message: "Contacts uploaded successfully.",
      count: contacts.length,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return response.serverError(res, "Internal server error");
  }
};