const express = require('express');

// IMPORT CONTROLLERS
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

// CREATE THE ROUTER
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(authController.protect, reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'), // Only users with "role: 'user'" can write reviews
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

// EXPORT ALL THE ROUTERS
module.exports = router;
