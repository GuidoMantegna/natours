const Review = require('../models/reviewModel');
const Booking = require('../models/bookingModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId; // If there isn't a tour id, we take it from the URL param
  if (!req.body.user) req.body.user = req.user.id; // If there isn't a user id, we take it from the req
  next();
};

exports.allowIfHaveBooked = catchAsync(async (req, res, next) => {
  const userHasThisTour = await Booking.findOne({"user": req.body.user})
  if(!userHasThisTour) {
    return next(new AppError('You have to book the tour to leave a review', 401));
  }
  next();
});

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
