const express = require('express');

// IMPORT CONTROLLERS
const {
  getTour,
  getAllTours,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats
} = require('../controllers/tourController');

// CREATE THE ROUTER
const router = express.Router();

/* Before we call getAllTours from the tours controller, 
we use a middleware that can actually manipulate and filter the tours */
router.route('/top-5-cheap').get(aliasTopTours, getAllTours)

router.route('/tour-stats').get(getTourStats)

router.route('/').get(getAllTours).post(createTour);

router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);
// EXPORT ALL THE ROUTERS
module.exports = router;
