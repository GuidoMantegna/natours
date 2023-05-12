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
  // console.log('Hello from the middleware 👋');
  next();
});
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 2. To connect all routers with our app, we use it as a middleware
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// EXPORT APP TO USE IT IN SERVER.JS
module.exports = app;
