const fs = require('fs');
const express = require('express');
// This here is a function which upon calling will add a bunch of methods to our app variable here.
const app = express();

/* express.json() here is middleware, and middleware is basically a function that can modify
the incoming request data. It's called middleware because it stands between the request 
and the response. It's just a step that the request goes through while it's being processed. */
app.use(express.json());

/* We can do that because the top-level code is only executed once, which is right after
the application startup. So that simply reads the tours into a variable outside of all 
the a synchronous way.*/
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
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

// app.get('/api/v1/tours', getAllTours)
// app.get('/api/v1/tours/:id', getTour)
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

/* First we specify the route that we want and then what we want to happen for each method. */
app.route('/api/v1/tours').get(getAllTours).post(createTour);

app.route('/api/v1/tours/:id').get(getTour).patch(updateTour).delete(deleteTour)

/* here we create a variable for the port that we are gonna use in app.listen() */
const port = 3000;
/* first we call app.listen() to basically start up a server.
That is a bit similar to what we did before with the http package. 
It receives a port and a callback func. which will be called as soon as the 
server starts listening */
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
