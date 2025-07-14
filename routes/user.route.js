const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const contact = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// Multer setup with diskStorage to preserve original filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage, limits: { fileSize: MAX_SIZE } });

// Upload route
router.post(
  "/contact/upload-contacts",
  authMiddleware,
  upload.single("file"),
  contact.uploadContacts
);

router.post(
  "/contact/add",
  authMiddleware,
  contact.insertSingleContact
);

// Get contact details (by companyid or all)
router.post(
  "/contact/details",
  authMiddleware,
  contact.getContactDetails
);

router.post(
  "/contact/delete",
  authMiddleware,
  contact.deleteContact
);

router.post(
  "/contact/update",
  authMiddleware,
  contact.updateContact
);

// Delete multiple contacts
router.post(
  "/contact/delete-multiple",
  authMiddleware,
  contact.deleteMultipleContacts
);

module.exports = router;
