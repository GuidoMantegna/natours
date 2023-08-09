const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      // here each Review document now knows what tour it belongs to.
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      // here each Review document now knows what user it belongs to.
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* Here we apply the populate to all the review queries which include 'find' */
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user', // prop to populate
    select: 'name photo', // field to get
  });
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
