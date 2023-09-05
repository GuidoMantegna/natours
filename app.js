const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
// ROUTERS
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// GLOBAL MIDDLEWARES
// Serving static files
/* here we pass the directory from which we want to serve static files. */
app.use(express.static(path.join(__dirname, 'public')));
// Set security HTTP headers
app.use(helmet());

// Development Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 100 requests per hour.
  message: 'Too many requests from this IP, please try again in an hour!',
});
/* we can do it like this: app.user(limiter), 
but what we actually want is to basically limit access to our API route. */
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS (cross-site scripting attacks)
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    // Define the params which actually can be duplicated
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 2. ROUTES
app.get('/', (req, res) => {
  // render will then render the template with the name that we pass in
  res.status(200).render('base', {
    tour: 'The Forest Hiker',
    user: 'Jonas',
  });
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

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
