const express = require('express');
const morgan = require('morgan');
// ROUTERS
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
/* here we pass the directory from which we want to serve static files. */
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 2. ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

/* app.all() gonna run for all the verbs (GET, POST, DELETE...) 
  '*' stands for everything */
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });

  /* We're creating an error and we then define 
  the status and status code properties on it 
  so that our error handling middleware
  can then use them in the next step. */
  const err = new Error(`Can't find ${req.originalUrl} on this server!`)
  err.status = 'fail';
  err.statusCode = 404;

  /* if the next function receives an argument, no matter what it is,
  Express will automatically know that there was an error 
  (it will skip all other middlewares in the stack 
  and go straight to the error one).*/
  next(err)
});

/* by specifying four parameters, Express automatically knows that this entire
function here is an error handling middleware. */
app.use((err, req, res, next) => {
  // if err.statusCode is not defined we define it as 500 
  err.statusCode = err.statusCode || 500;
  // if err.status is not defined we define it as 'error' 
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  })
})

// EXPORT APP TO USE IT IN SERVER.JS
module.exports = app;
