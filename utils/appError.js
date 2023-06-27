/* all the errors that we will create using this class will 
all be operational errors, errors that we can predict will 
happen in some point in the future */
class AppError extends Error {
  constructor(message, statusCode) {
    /* here we call the parent class, and the parent class is 'error',
    and whatever we pass into it is gonna be the message property.
    So, basically, in here by doing this parent call 
    we already set the message property to our incoming message. */
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
