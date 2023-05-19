const Tour = require('./../models/tourModel');

exports.getAllTours = async (req, res) => {
  try {
    // FIRST WE BUILD THE QUERY
    // 1A) Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj)
    // here we replace (gte, gt, lte, lt) x ($gte, $gt, $lte, $lt) 
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    // WE SAVE THE QUERY
    let query = Tour.find(JSON.parse(queryStr));

    // 2) Sorting
    if(req.query.sort) {
      /* .sort() is one of the many methods that are available on all documents created with query class. */
      /* If a string is passed, it must be a space delimited list of path names so, 
      instead of passing it into sort method as we received from the query { sort: '-price,ratingsAverage' },
      we need to pass it this way '-price ratingsAverage' */

      const sortBy = req.query.sort.split(',').join(' ');

      query = query.sort(sortBy)
    } else {
      query = query.sort('-createdAt')
    }

    // WE EXECUTE THE QUERY
    const tours = await query;

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
