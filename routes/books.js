// routes/books.js
const express = require('express');
const auth = require('../middleware/authMiddleware');
const {
  addBook, getBooks, getBookById, addReview, searchBooks,
  updateBook,
  deleteBook
} = require('../controllers/bookController');
const router = express.Router();

router.post('/books', auth, addBook);
router.get('/books', getBooks);
router.get('/books/:id', getBookById);
router.post('/books/:id/reviews', auth, addReview);
router.get('/search', searchBooks);

router.put('/books/:id', auth, updateBook);
router.delete('/books/:id', auth, deleteBook);

module.exports = router;
