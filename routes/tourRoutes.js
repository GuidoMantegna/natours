const express = require('express');

// IMPORT CONTROLLERS
const {
  getTour,
  getAllTours,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
} = require('../controllers/tourController');

const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');
const reviewRouter = require('./../routes/reviewRoutes');

// CREATE THE ROUTER
const router = express.Router();

/* we will basically say that the tour router should use the 
review router in case it ever encounters a route like this. 
First gonna reach the tour router app.use('/api/v1/tours', tourRouter);
Then, when it matches '/:tourId/reviews' it will continue with reviewRouter. */
router.use('/:tourId/reviews', reviewRouter);

/* Before we call getAllTours from the tours controller, 
we use a middleware that can actually manipulate and filter the tours */
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);

router.route('/').get(authController.protect, getAllTours).post(createTour);

router.route('/:id').get(getTour).patch(updateTour).delete(
  // authentication
  authController.protect,
  // authorization
  authController.restrictTo('admin', 'lead-guide'),
  deleteTour
);

// EXPORT ALL THE ROUTERS
module.exports = router;
