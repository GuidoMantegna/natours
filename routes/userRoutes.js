const express = require('express');
const {
  getAllusers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
} = require('../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch(
  '/updateMyPassword',
  authController.protect, // only for auth. users
  authController.updatePassword
);

/*
1) .protect will then add the user to the current req., which will then allow us to read the ID from that user
2) .getMe puts that userId into the params (basically faking that the ID is actually coming from the URL)
3) finally we can use getUser   
*/
router.get('/me', authController.protect, getMe, getUser);
router.patch(
  '/updateMe',
  authController.protect, // only for auth. users
  updateMe
);
router.delete(
  '/deleteMe',
  authController.protect, // only for auth. users
  deleteMe
);

router.route('/').get(getAllusers).post(createUser);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
