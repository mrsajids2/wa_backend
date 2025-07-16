const express = require('express');
const router = express.Router();
const templateController = require('../controllers/template.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Create template and send for approval
router.post('/template/create', authMiddleware, templateController.createTemplate);

// Approve template (called by Kafka consumer or admin)
router.post('/template/update', authMiddleware, templateController.approveTemplate);

// Get template details with filters and pagination
router.post('/template/details', authMiddleware, templateController.getTemplates);

// Delete template by id
router.post('/template/delete', authMiddleware, templateController.deleteTemplate);

module.exports = router;
