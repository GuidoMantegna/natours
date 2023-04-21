const express = require('express');
// IMPORT CONTROLLERS
const {
  getTour,
  getAllTours,
  createTour,
  updateTour,
  deleteTour,
} = require('../controllers/tourController');
// CREATE THE ROUTER
const router = express.Router();

router.route('/').get(getAllTours).post(createTour);

router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);
// EXPORT AL THE ROUTERS
module.exports = router;
