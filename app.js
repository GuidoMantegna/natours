const fs = require('fs');
const express = require('express');
// This here is a function which upon calling will add a bunch of methods to our app variable here.
const app = express();
const morgan = require('morgan');

// MIDDLEWARES
/* into this function, we can pass an argument which will kind of specify how we want the logging to look like. 
morgan() will return the same callback() that we set in customs middlewares (req, res, next) => {} */
app.use(morgan('dev')); // GET /api/v1/tours 200 11.728 ms - 8618

app.use(express.json());

app.use((req, res, next) => {
  console.log('Hello from the middleware 👋')

  /* if we didn't call next here, the request/response cycle 
  would really be stuck at this point, we wouldn't be able to move on,
  and we would never ever send back a response to the client. */
  next();
})

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString(); 
  next();
})

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// ROUTE HANDLERS / CONTROLLERS
const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours,
    },
  });
};

const getTour = (req, res) => {
  // req.params is where all the parameters of all the variables that we define are stored
  // console.log(req.params)
  const idParam = Number(req.params.id);

  if (idParam > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  } else {
    const tour = tours.find((el) => el.id === idParam);

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  }
};

const createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      // status 201 stands for created
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

const updateTour = (req, res) => {
  if (Number(req.params.id) > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>',
    },
  });
};

const deleteTour = (req, res) => {
  if (Number(req.params.id) > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  /* When we have a delete request, the response is usually a 204.
  204 means no content and so that's because, as a result, we 
  usually don't sent any data back. */
  res.status(204).json({
    status: 'success',
    data: null, // null is simply to show that the resource that we deleted now no longer exists.
  });
};

const getAllusers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined'
  });
};

const getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined'
  });
};

const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined'
  });
};
const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined'
  });
};
const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined'
  });
};

// ROUTES
// 1. Create a new Router
const tourRouter = express.Router()
const userRouter = express.Router()

// 2. To connect all routers with our app, we use it as a middleware
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

// 3. Use it in each case
tourRouter
  // .route('/api/v1/tours')
  // We need to change the route because the tourRouter only runs in its particular route
  .route('/')
  .get(getAllTours)
  .post(createTour);

tourRouter
  // .route('/api/v1/tours/:id')
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour)

userRouter
  .route('/')
  .get(getAllusers)
  .post(createUser);

userRouter
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

// START SERVER
/* here we create a variable for the port that we are gonna use in app.listen() */
const port = 3000;
/* first we call app.listen() to basically start up a server.
That is a bit similar to what we did before with the http package. 
It receives a port and a callback func. which will be called as soon as the 
server starts listening */
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
