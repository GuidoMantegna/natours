const express = require('express');

// IMPORT CONTROLLERS
const tourController = require('../controllers/tourController');
const authController = require('./../controllers/authController');
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
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
// /tours-within?distance=233&center=-40,45&unit=mi
// /tours-within/233/center/-40,45/unit/mi

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    tourController.updateTour,
    authController.protect,
    authController.restrictTo('admin', 'lead-guide')
  )
  .delete(
    // authentication
    authController.protect,
    // authorization
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

// EXPORT ALL THE ROUTERS
module.exports = router;
