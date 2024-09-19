/* 
Global error handling function for the app
Is called whenever next(err) is called anywhere/anytime during a process
*/
const { StatusCodes } = require('http-status-codes');
const APPError = require('../utils/appError');

const sendErrorDev = (res, err) => {
  console.log('Logging error from development');
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrProd = (res, err) => {
  console.log('Logging error from production');
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // 1) Log error
  console.error('Error 💥', err);
  // 2) Send generic message to client
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    status: 'error',
    message: 'Uh Oh! Something went wrong!',
  });
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new APPError(message, StatusCodes.BAD_REQUEST);
};

const handleDuplicateKeyDB = (err) => {
  // TODO: add /"${err.keyValue.name}/" below
  const message = `Duplicate field value: ${err.keyValue.name}. Please use another value!`;
  return new APPError(message, StatusCodes.BAD_REQUEST);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((err) => err.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new APPError(message, StatusCodes.BAD_REQUEST);
};

module.exports = (err, req, res, next) => {
  let error = { ...err };
  error.statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  error.status = err.status || 'error';
  // Operational, trusted error: send message to client
  if (process.env.NODE_ENV === 'development') return sendErrorDev(res, error);

  // Programming or other unknown error: don't leak error details
  // if (error.name === 'CastError') error = handleCastErrorDB(error);
  console.log(error);
  if (error.kind === 'ObjectId') error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateKeyDB(error);
  if (error._message === 'Validation failed')
    error = handleValidationErrorDB(error);
  if (process.env.NODE_ENV === 'production') return sendErrProd(res, error);
};
