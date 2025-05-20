const Review = require('../models/Review');
const response = require('../utils/responseManager');

// Update a review (only user's own)
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return response.notFound(res, "Review not found");
    }
console.log(review,req.user);

    if (!review.user || !review.user.equals(req.user._id)) {
      return response.forbidden(res, "You are not allowed to update this review");
    }

    review.rating = req.body.rating ?? review.rating;
    review.comment = req.body.comment ?? review.comment;

    await review.save();

    return response.success(res, "Review updated successfully", review);
  } catch (err) {
    return response.serverError(res, "Failed to update review", err.message);
  }
};


// Delete a review (only user's own)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return response.notFound(res, "Review not found");
    }

    if (!review.user || !review.user.equals(req.user._id)) {
      return response.forbidden(res, "You are not allowed to delete this review");
    }

    await review.deleteOne(); // or review.remove() for older Mongoose versions

    return response.success(res, "Review deleted successfully");
  } catch (err) {
    return response.serverError(res, "Failed to delete review", err.message);
  }
};
