module.exports = (err, req, res, next) => {
  // err.stack will basically show us where the error happened.
  // console.log(err.stack)
  // if err.statusCode is not defined we define it as 500 
  err.statusCode = err.statusCode || 500;
  // if err.status is not defined we define it as 'error' 
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  })
}