const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError')

exports.aliasTopTours = (req, res, next) => {
  // 1st we set the qty of results
  req.query.limit = '5';
  // 2nd we have the way we gonna sort
  req.query.sort = '-ratingsAverage,price';
  // 3rd specify some fields so that the user doesn't get all the fields
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

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

// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/34.111745,-118.113491/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400
      )
    );
  }
  // console.log(distance, lat, lng, unit)
  const tours = await Tour.find({
    /* in the filter object we want to query for 'startLocation':
    - The startLocation field is what holds the geospatial point where each tour starts.
    - Then, we use geospatial operator 'geoWithin'. It finds documents within a certain geometry.
    - That geometry is what we need to define as a next step  */
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400
      )
    );
  }

  /* Here we passed in an array with all the stages of the aggregation pipeline that we want to define. */
  const distances = await Tour.aggregate([
    {
      /* for geospatial aggregation, there's actually only one single stage: geoNear 
      🚨 it always needs to be the first one in the pipeline
      🚨 it requires at least one of our fields contains a geospatial index */
      $geoNear: {
        // near is the point from which to calculate the distances
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      // with $project we can define the name of the fields that we want to keep
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
});