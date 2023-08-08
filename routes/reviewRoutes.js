const express = require('express');

// IMPORT CONTROLLERS
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

// CREATE THE ROUTER
const router = express.Router();

router
  .route('/')
  .get(authController.protect, reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'), // Only users with "role: 'user'" can write reviews
    reviewController.createReview
  );

// EXPORT ALL THE ROUTERS
module.exports = router;
