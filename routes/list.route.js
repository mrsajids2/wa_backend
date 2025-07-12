const express = require('express');
const router = express.Router();
const list = require('../controllers/list.controller');
const authMiddleware = require("../middleware/auth.middleware");

router.post('/statelist',authMiddleware, list.getAllStates);
router.post('/citylist',authMiddleware, list.getCitiesByState);
// router.get('/', cityController.getCities);
// router.get('/state/:stateId', cityController.getCitiesByState);

module.exports = router;
