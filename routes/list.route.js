const express = require('express');
const router = express.Router();
const list = require('../controllers/list.controller');

router.post('/statelist', list.getAllStates);
router.post('/citylist', list.getCitiesByState);
// router.get('/', cityController.getCities);
// router.get('/state/:stateId', cityController.getCitiesByState);

module.exports = router;
