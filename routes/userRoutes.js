const express = require('express');
const router = express.Router();
const {
  getAllusers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

router.route('/').get(getAllusers).post(createUser);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
