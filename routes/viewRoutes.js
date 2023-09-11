const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

/* Putting this mid. here, before all the other routes, so then it will be put 
in the middleware stack for each and every request that comes in. */
router.use(authController.isLoggedIn)

router.get('/', viewsController.getOverview);
router.get('/tour/:slug', viewsController.getTour);
router.get('/login', viewsController.getLoginForm);

module.exports = router;
