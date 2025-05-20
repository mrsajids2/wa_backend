// models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: Number,
  comment: String
}, { timestamps: true });

module.exports = mongoose.model("Review", reviewSchema);
