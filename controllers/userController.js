const multer = require('multer');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => { 
    /* cb stands for 'callback': 
    the first argument is an error if there is one, and if not, then just null.
    the second argument is the actual destination.*/
    cb(null, 'public/img/users');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`); // user-98839dijd98-546546654.jpg
  }
});

/* the goal here is basically to test if the uploaded file is an image.
If it is so, then we pass true into the callback(),
and if it's not we pass false into the callback() along with an error. */
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  /* getOne() takes the id from the params but in this case '/me'
  doesn't receives that param, so we can set it using req.user.id */
  req.params.id = req.user.id;
  next();
}

exports.updateMe = catchAsync(async (req, res, next) => {
  console.log(req.file)
  console.log(req.body)
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3) Update user document
  /* we cannot use save() here because there are some fields that are required which we're not updating, 
  and then because of that, we will get some errors. We can use findByIdAndUpdate() instead, 
  since we're not dealing with passwords, but only with this non-sensitive data like name or email,*/
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true, // this val. will catch for ex. an invalid email address
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined! Please use /signup instead',
  });
};

// Do NOT update passwords with this
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.getAllusers = factory.getAll(User);
exports.getUser = factory.getOne(User);
