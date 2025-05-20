// routes/reviews.js
const express = require('express');
const { updateReview, deleteReview } = require('../controllers/reviewController');
const { verifytoken } = require('../utils/userHelper');

const router = express.Router();

router.put('/reviews/:id', verifytoken, updateReview);
router.delete('/reviews/:id', verifytoken, deleteReview);

module.exports = router;
