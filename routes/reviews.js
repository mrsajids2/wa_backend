// routes/reviews.js
const express = require('express');
const { updateReview, deleteReview } = require('../controllers/reviewController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

router.put('/reviews/:id', auth, updateReview);
router.delete('/reviews/:id', auth, deleteReview);

module.exports = router;
