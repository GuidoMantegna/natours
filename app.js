const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
// ROUTERS
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');
const viewRouter = require('./routes/viewRoutes');

const app = express();

// GLOBAL MIDDLEWARES
// Implement CORS
app.use(cors()) // Access-Control-Allow-Origin *

/* 
  1. we need to define the route for which we want to handle the options (all)
  2. then basically the handler, which once more is the CORS middleware
*/
app.options('*', cors());

// Serving static files
/* here we pass the directory from which we want to serve static files. */
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet());

app.enable('trust proxy')

// LEAFLET CONFIG ----------------------------
// Further HELMET configuration for Security Policy (CSP)
const scriptSrcUrls = ['https://unpkg.com/', 'https://tile.openstreetmap.org'];
const styleSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://fonts.googleapis.com/',
];
const connectSrcUrls = [
  'https://unpkg.com',
  'https://tile.openstreetmap.org',
  "'self'",
  "'unsafe-inline'",
  'data:',
  'blob:',
  'https://*.stripe.com',
  'https://*.mapbox.com',
  'https://*.cloudflare.com/',
  'https://bundle.js:*',
  'ws://127.0.0.1:*/',
];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
  // helmet({
  //   contentSecurityPolicy: {
  //     directives: {
  //       defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
  //       baseUri: ["'self'"],
  //       fontSrc: ["'self'", 'https:', 'data:'],
  //       scriptSrc: [
  //         "'self'",
  //         'https:',
  //         'http:',
  //         'blob:',
  //         'https://*.mapbox.com',
  //         'https://js.stripe.com',
  //         'https://m.stripe.network',
  //         'https://*.cloudflare.com',
  //       ],
  //       frameSrc: ["'self'", 'https://js.stripe.com'],
  //       objectSrc: ["'none'"],
  //       styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
  //       workerSrc: [
  //         "'self'",
  //         'data:',
  //         'blob:',
  //         'https://*.tiles.mapbox.com',
  //         'https://api.mapbox.com',
  //         'https://events.mapbox.com',
  //         'https://m.stripe.network',
  //       ],
  //       childSrc: ["'self'", 'blob:'],
  //       imgSrc: ["'self'", 'data:', 'blob:'],
  //       formAction: ["'self'"],
  //       connectSrc: [
  //         "'self'",
  //         "'unsafe-inline'",
  //         'data:',
  //         'blob:',
  //         'https://*.stripe.com',
  //         'https://*.mapbox.com',
  //         'https://*.cloudflare.com/',
  //         'https://bundle.js:*',
  //         'ws://127.0.0.1:*/',

  //       ],
  //       upgradeInsecureRequests: [],
  //     },
  //   },
  // })
);
// -------------------------------------------

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

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

app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
// Parse the data from cookies
app.use(cookieParser());

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

app.use(compression())

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 2. ROUTES
app.use('/', viewRouter); // this is mounted right on the root URL
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

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
