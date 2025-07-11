const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const contactController = require('../controllers/contact.controller');

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// Multer setup with diskStorage to preserve original filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage, limits: { fileSize: MAX_SIZE } });

// Upload route
router.post('/upload-contacts', upload.single('file'), contactController.uploadContactswithExcel);

module.exports = router;
