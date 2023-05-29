const Tour = require('./../models/tourModel');

exports.aliasTopTours = (req, res, next) => {
  // 1st we set the qty of results
  req.query.limit = '5';
  // 2nd we have the way we gonna sort
  req.query.sort = '-ratingsAverage,price';
  // 3rd specify some fields so that the user doesn't get all the fields
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
}

exports.getAllTours = async (req, res) => {
  try {
    // FIRST WE BUILD THE QUERY
    // 1A) Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    // here we replace (gte, gt, lte, lt) x ($gte, $gt, $lte, $lt)
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // WE SAVE THE QUERY
    let query = Tour.find(JSON.parse(queryStr));

    // 2) Sorting
    if (req.query.sort) {
      /* .sort() is one of the many methods that are available on all documents created with query class. */
      /* If a string is passed, it must be a space delimited list of path names so, 
      instead of passing it into sort method as we received from the query { sort: '-price,ratingsAverage' },
      we need to pass it this way '-price ratingsAverage' */

      const sortBy = req.query.sort.split(',').join(' ');

      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // 3) Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');

      query = query.select(fields);
    } else {
      // minus '-' means to exclude something
      query = query.select('-__V');
    }

    // 4) Pagination

    //'*1' converts a string to number - '|| value' defines a default value
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    // e.g. (3 - 1) * 10 = 20 --> will skip 20 results, and return from 21 to 30 (page 3)
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    if (req.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('This page does not exist');
    }

    // WE EXECUTE THE QUERY
    const tours = await query;
    // query.sort().select().skip().limit()

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id); // Tour.findOne({ _id: req.params.id })
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    // const newTour = new Tour({});
    // newTour.save();
    // Tour.create({}) will do both things: create & save a new Tour
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    /* findByIdAndUpdate() takes three params:
    1. the id
    2. the data that we actually want to change (the body)
    3. we can patch in some options */
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // this way, then the new updated document is the one that will be returned.
      runValidators: true, // each time that we update a certain document, then the validators that we specified in the schema will run again
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};
