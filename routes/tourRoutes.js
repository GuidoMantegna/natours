const express = require('express');

// IMPORT CONTROLLERS
const {
  getTour,
  getAllTours,
  createTour,
  updateTour,
  deleteTour,
  checkID,
  checkBody
} = require('../controllers/tourController');

// CREATE THE ROUTER
const router = express.Router();

// PARAM MIDDLEWARE
// So, first we check if the 'id' is valid, and then continue with the flow
router.param('id', checkID)

router
  .route('/')
  .get(getAllTours)
  // To chain a middleware func(), we have to call it before the cotroller
  .post(checkBody, createTour);

router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);
// EXPORT ALL THE ROUTERS
module.exports = router;
