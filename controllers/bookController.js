const Book = require("../models/Book");
const Review = require("../models/Review");
const response = require("../utils/responseManager");

// Add a new book (Authenticated)
exports.addBook = async (req, res) => {
  try {
    const { title, author, genre } = req.body;

    // Simple validation
    if (!title || !author || !genre) {
      return response.badRequest(res, "Title, author, and genre are required.");
    }

    const book = await Book.create({
      title,
      author,
      genre,
      createdBy: req.user._id,
    });

    return response.created(res, "Book created successfully", book);
  } catch (err) {
    return response.serverError(res, "Failed to create book", err.message);
  }
};

// Get all books (with pagination and optional filters)
exports.getBooks = async (req, res) => {
  try {
    const { author, genre, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (author) filter.author = new RegExp(author, "i");
    if (genre) filter.genre = genre;

    const books = await Book.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    if (books.length === 0) {
      return response.notFound(res, "No books found");
    }

    return response.success(res, "Books fetched successfully", books);
  } catch (err) {
    return response.serverError(res, "Failed to fetch books", err.message);
  }
};

// Get book by ID, include average rating and paginated reviews
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return response.notFound(res, "Book not found");

    const reviews = await Review.find({ book: book._id });
    const avgRating =
      reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1);

    const { page = 1, limit = 5 } = req.query;
    const paginatedReviews = await Review.find({ book: book._id })
      .populate("user", "username")
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return response.success(res, "Book fetched successfully", {
      book,
      averageRating: avgRating.toFixed(1),
      reviews: paginatedReviews,
    });
  } catch (err) {
    return response.serverError(res, "Failed to fetch book", err.message);
  }
};

// Submit a review (only once per user per book)
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const bookId = req.params.id;

    if (!rating) {
      return response.badRequest(res, "Rating is required");
    }

    const alreadyReviewed = await Review.findOne({
      book: bookId,
      user: req.user._id,
    });
    if (alreadyReviewed) {
      return response.badRequest(res, "You have already reviewed this book");
    }

    const review = await Review.create({
      book: bookId,
      user: req.user._id,
      rating,
      comment,
    });

    return response.created(res, "Review added successfully", review);
  } catch (err) {
    return response.serverError(res, "Failed to add review", err.message);
  }
};

// Search by title or author (partial, case-insensitive)
exports.searchBooks = async (req, res) => {
  try {
    const { q } = req.query;
    console.log(q);
    
    if (!q) {
      return response.badRequest(res, "Search query (q) is required");
    }

    const regex = new RegExp(q, "i");
    const books = await Book.find({
      $or: [{ title: regex }, { author: regex }],
    });

    return response.success(res, "Search results", books);
  } catch (err) {
    return response.serverError(res, "Search failed", err.message);
  }
};
