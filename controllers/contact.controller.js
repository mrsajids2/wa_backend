const { getAllContacts, insertSingleContact, checkUserExists } = require("../respository/contact.repository");
const fs = require("fs");
const path = require("path");
const { insertManyContacts } = require("../respository/contact.repository");
const { parseCSV, parseExcel } = require("../utils/common");
const response = require("../utils/responseManager");

exports.uploadContacts = async (req, res) => {
  // Step 1: req body validation
  const { companyid } = req.body;
  if (!companyid) {
    return response.forbidden(res, "Companyid is required");
  }

  try {
    // Step 2: file validation
    if (!req.file) {
      return response.badRequest(res, "No file uploaded.");
    }

    const filePath = req.file.path;
    const ext = path.extname(filePath).toLowerCase();
    const allowedExt = [".csv", ".xls", ".xlsx"];

    if (!allowedExt.includes(ext)) {
      fs.unlinkSync(filePath);
      return response.badRequest(res, "No file uploaded.");
    }

    let contacts = [];
    if (ext === ".csv") {
      contacts = await parseCSV(filePath);
    } else {
      contacts = parseExcel(filePath);
    }

    fs.unlinkSync(filePath); // remove file after parsing
    console.log("Parsed contacts:", contacts);

    const { successCount, failedCount } = await insertManyContacts(
      "company",
      companyid,
      contacts
    );

    return response.success(res, 200, "Contacts uploaded successfully.", {
      message: "Contacts uploaded successfully.",
      total: contacts.length,
      successCount,
      failedCount,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return response.serverError(res, "Internal server error");
  }
};

exports.getContactDetails = async (req, res) => {
  const {
    companyid,
    mobileno,
    search = "",
    page = 1,
    pageSize = 10,
  } = req.body;
  try {    
    const filterConditions = {};
    if (companyid) {
      filterConditions.companyid = companyid;
    }
    if (mobileno) {
      filterConditions.mobileno = mobileno;
    }
    const result = await getAllContacts("company", {
      filterConditions,
      search,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
    if (!result.contacts || result.contacts.length === 0) {
      return response.notFound(res, 404, "No data found", {
        contacts: [],
        total: 0,
        page: parseInt(page, 10),
        pageSize: parseInt(pageSize, 10),
        totalPages: 0,
      });
    }
    return response.success(res, 200, "Success", result);
  } catch (err) {
    console.error("Get contact details error:", err);
    return response.serverError(res, "Internal server error");
  }
};

exports.insertSingleContact = async (req, res) => {
  try {
    const {
      companyid,
      username,
      mobileno,
      countrycode,
      email,
      usercategory,
      stateid,
      cityid,
      address
    } = req.body;

    // Validate required fields
    if (!mobileno) {
      return response.forbidden(res, "Either mobile number is required.");
    }

    if (!companyid || !username || !usercategory || !stateid || !cityid ) {
      return response.forbidden(res, "All Fields required.");
    }

    
    let  existingUser = await checkUserExists("company", mobileno,countrycode);
    if (existingUser) {
      return response.alreadyExist(res, "User already registered.");
    }

    const user = await insertSingleContact("company", companyid, {
      companyid,
      username,
      mobileno,
      countrycode,
      email,
      usercategory,
      stateid,
      cityid,
      address
    });
    return response.success(res, 200, "Saved successfully.", {
    });
  } catch (err) {
    console.error('Error creating user:', err);
    return response.serverError(res, "Internal server error");
  }
};

