const mongoose = require('mongoose');
const Tour = require('./tourModel');

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

/* each combination of tour and user has always to be unique. */
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

/* Here we apply the populate to all the review queries which include 'find' */
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user', // prop to populate
    select: 'name photo', // field to get
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  /* we use the aggregation pipeline to create some statistics.
  We called the aggregate method directly on the model. */
  const stats = await this.aggregate([
    // In static method 'this' points to the current model
    {
      // select all the reviews that actually belong to the current tour
      $match: { tour: tourId },
    },
    {
      // calculate the statistics themselves
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 }, // add one for each tour that we have
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stats);

  // Find the current tour and update it
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  // this points to current review
  // the constructor is basically the model who created that document (Model).
  this.constructor.calcAverageRatings(this.tour);
});

// findByIdAndUpdate
// findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function (next) {
  /* here "this" is the current query. We can basically execute a query,
  and then that will give us the document that's currently being processed. */
  this.r = await this.findOne(); // Using this.r we can pass the review to the post middleware
  // console.log(this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); does NOT work here, query has already executed
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
