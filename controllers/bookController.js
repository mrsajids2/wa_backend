const Book = require('../models/Book');
const Review = require('../models/Review');

// Add a new book (Authenticated)
exports.addBook = async (req, res) => {
  try {
    const { title, author, genre } = req.body;
    const book = await Book.create({
      title,
      author,
      genre,
      createdBy: req.user._id,
    });
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all books (with pagination and optional filters)
exports.getBooks = async (req, res) => {
  try {
    const { author, genre, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (author) filter.author = new RegExp(author, 'i');
    if (genre) filter.genre = genre;

    const books = await Book.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get book by ID, include average rating and paginated reviews
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });

    const reviews = await Review.find({ book: book._id });
    const avgRating =
      reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1);

    const { page = 1, limit = 5 } = req.query;
    const paginatedReviews = await Review.find({ book: book._id })
      .populate('user', 'username')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      book,
      averageRating: avgRating.toFixed(1),
      reviews: paginatedReviews,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Submit a review (only once per user per book)
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const bookId = req.params.id;

    // Check if user already reviewed this book
    const existing = await Review.findOne({ book: bookId, user: req.user._id });
    if (existing) return res.status(400).json({ error: 'Already reviewed' });

    const review = await Review.create({
      book: bookId,
      user: req.user._id,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Search by title or author (partial, case-insensitive)
exports.searchBooks = async (req, res) => {
  try {
    const { q } = req.query;
    const regex = new RegExp(q, 'i');

    const books = await Book.find({
      $or: [{ title: regex }, { author: regex }],
    });

    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
