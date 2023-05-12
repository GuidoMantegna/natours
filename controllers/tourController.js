const Tour = require('./../models/tourModel');

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    // results: tours.length,
    // data: {
    //   tours,
    // },
  });
};

exports.getTour = (req, res) => {
  // req.params is where all the parameters of all the variables that we define are stored
  // console.log(req.params)
  const idParam = Number(req.params.id);

  // const tour = tours.find((el) => el.id === idParam);

  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     tour,
  //   },
  // });
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
      message: 'Invalid data sent!',
    });
  }
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>',
    },
  });
};

exports.deleteTour = (req, res) => {
  /* When we have a delete request, the response is usually a 204.
    204 means no content and so that's because, as a result, we 
    usually don't sent any data back. */
  res.status(204).json({
    status: 'success',
    data: null, // null is simply to show that the resource that we deleted now no longer exists.
  });
};
