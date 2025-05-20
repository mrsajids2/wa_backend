// routes/books.js
const express = require('express');
const {
  addBook, getBooks, getBookById, addReview, searchBooks
} = require('../controllers/bookController');
const { verifytoken } = require('../utils/userHelper');

const router = express.Router();

router.post('/books', verifytoken, addBook);
router.get('/books', getBooks);
router.get('/books/:id', getBookById);
router.post('/books/:id/reviews', verifytoken, addReview);
router.get('/search', searchBooks);

module.exports = router;
