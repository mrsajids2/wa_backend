const express = require("express");
const router = express.Router();
const callback = require("../controllers/callback.controller");

// GET for whatsapp verification
router.get("/webhook", callback.verifyWebhook);

// POST for whatsapp messages
router.post("/webhook", callback.receiveMessage);

module.exports = router;
