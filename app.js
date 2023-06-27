const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
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

/* app.all() gonna run for all the verbs (GET, POST, DELETE...) - '*' stands for everything */
app.all('*', (req, res, next) => {
  /* We're creating an error and we then define the status and status code properties on it 
  so that our error handling middleware can then use them in the next step. */

  /* if the next function receives an argument, no matter what it is,
  Express will automatically know that there was an error 
  (it will skip all other middlewares in the stack 
  and go straight to the error one).*/
  next(new AppError(`Can't find ${req.originalUrl} on this server!`), 404);
});

app.use(globalErrorHandler);

// EXPORT APP TO USE IT IN SERVER.JS
module.exports = app;
