const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.aliasTopTours = (req, res, next) => {
  // 1st we set the qty of results
  req.query.limit = '5';
  // 2nd we have the way we gonna sort
  req.query.sort = '-ratingsAverage,price';
  // 3rd specify some fields so that the user doesn't get all the fields
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  // WE EXECUTE THE QUERY
  /* here, we need to pass a query object (Tour.find()) and the queryString (req.query),
    and then call the methods we want */
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate('reviews')

  if (!tour) {
    /* we call next() with an error in order to jump straight into our error handling middleware. 
    We use AppError classes defining the 'message' & 'statusCode' */
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  /* findByIdAndUpdate() takes three params:
    1. the id
    2. the data that we actually want to change (the body)
    3. we can patch in some options */
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // this way, then the new updated document is the one that will be returned.
    runValidators: true, // each time that we update a certain document, then the validators that we specified in the schema will run again
  });

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    /* This is the first stage, and this stage will match only the tours 
       which ratingsAverage are greater or equal than 4.5 */
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        /* The first thing is always to specify the id 
           because this is where we're gonna specify what we want to group by. */
        _id: { $toUpper: '$difficulty' },
        /* Basically for each of the document that's gonna go through this pipeline,
           one will be added to this num counter. */
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        avgPrice: 1, // 1 is for ascending order
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      // $unwind deconstructs an array field from the input documents to output a document for each element.
      $unwind: '$startDates',
    },
    {
      // here we match only the tours for 2021 (year param)
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      // then we group them by month
      $group: {
        _id: { $month: '$startDates' }, // $month returns the month of a date as a number between 1 and 12.
        numToursStarts: { $sum: 1 },
        tours: { $push: '$name' }, // $push returns an array of all values that result from applying an expression to documents.
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 }, // $project is used to hide the specified field (if its zero)
    },
    {
      $sort: { numToursStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
