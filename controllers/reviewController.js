const Review = require('../models/Review');

// Update a review (only user's own)
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    if (!review.user.equals(req.user._id))
      return res.status(403).json({ error: 'Not allowed' });

    review.rating = req.body.rating ?? review.rating;
    review.comment = req.body.comment ?? review.comment;
    await review.save();

    res.json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a review (only user's own)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    if (!review.user.equals(req.user._id))
      return res.status(403).json({ error: 'Not allowed' });

    await review.remove();
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
