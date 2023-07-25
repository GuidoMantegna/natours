const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false, // this will automatically never show up 'password' in any output.
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // the callback() will be called when the new document is created
      // THIS ONLY WORKS ON CREATE AND SAVE: whenever we want to update a user,
      // we will always have to use SAVE as well and not, for example, 'find one and update'.
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
});

userSchema.pre('save', async function (next) {
  /* We only want to encrypt the password if the password field
  has been updated, if it is changed or when it's created a new one */
  if (!this.isModified('password')) return next();

  /* The second param we need to specify is a cost parameter. We could actually do this in two ways:
  1. manually generating the salt (the random string basically), then is gonna be added to our password.
  2. we can also simply pass a cost parameter. That is basically a measure of how CPU intensive this 
  operation will be */
  // bcrypt.hash() will return a promise so the func() should be async
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined; // we don't need to store the passwordConfirm

  next();
});

// PASSWORD CHECKING
/* an instance method is basically a method that is gonna be available 
on all documents of a certain collection */
userSchema.methods.correctPassword = async function (
  cadidatePassword,
  userPassword
) {
  // we can't do simply this.password because the password is not available in the output
  return await bcrypt.compare(cadidatePassword, userPassword);
};

// PASSWORD CHANGE CHECKING
/* into this function, we will pass the JWT timestamp.
So basically, that timestamp which says when the token was issued. */
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  /* by default, we will return false from this method, that will then mean
  that the user has not changed his password after the token was issued. */
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
