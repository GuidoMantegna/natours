const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  /* 1. we create a token
  payload: an object for all the data that we're going to store inside of the token
  secret: basically a string for a secret
  options */

  const token = jwt.sign(
    // payload
    { id: newUser._id },
    // secret
    process.env.JWT_SECRET,
    //options
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.status(201).json({
    status: 'success',
    // we send the token to the client
    token,
    data: {
      user: newUser,
    },
  });
});
