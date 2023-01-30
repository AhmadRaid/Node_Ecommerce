const AppError = require("../utils/AppError");

const sendErrorDev = (err, req, res) => {
  res.status(500).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, req, res) => {
  // A) API
 // if (req.originalUrl.startsWith('/api')) {
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
      console.log(err.message, err)
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    // B) Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error('ERROR 💥', err);
    // 2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  //}

  // B) RENDERED WEBSITE
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    });
  }
  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error('ERROR 💥', err);
  // 2) Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.'
  });
};

const handleCastErrorDB = (err) => {
  let message = `Invalid ${err.path}: ${err.value} `;
  return new AppError(message, 400);
};

const handleValidationError = err => {
  let errors = Object.values(err.errors).map(el => el.message);
  let message = `Invalid input data .${errors.join('.')}`;
  return new AppError(message , 400)
}

module.exports = (err, req, res, next) => {
  err.statusCode =  500;
  err.status =  "error";
  // its not true to change the value of parameter so we want to clone the object and modified 
 // let error = JSON.parse(JSON.stringify(err));

  if (process.env.NODE_ENV === "production") {

    if (err.name === "CastError") err = handleCastErrorDB(err)

    if (err.name === "ValidatorError") err = handleValidationError(err)
 
    sendErrorProd(err, req, res);
  } else if (process.env.NODE_ENV === "development") {
    console.log(err)
    sendErrorDev(err, req, res);
  }

  next();
};
