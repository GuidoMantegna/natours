const express = require('express');
const {
  getAllusers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
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
router.patch(
  '/updateMe',
  authController.protect, // only for auth. users
  updateMe
);

router.route('/').get(getAllusers).post(createUser);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
