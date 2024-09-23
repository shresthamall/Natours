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
    console.log('prod:isOperational/////', err);
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
  console.log('handleCastErrorDB');
  const message = `Invalid ${err.path}: ${err.value}`;
  return new APPError(message, StatusCodes.BAD_REQUEST);
};

const handleDuplicateKeyDB = (err) => {
  console.log('handleDuplicateKeyDB');
  // TODO: add /"${err.keyValue.name}/" below
  const message = `Duplicate field value: ${err.keyValue.name}. Please use another value!`;
  return new APPError(message, StatusCodes.BAD_REQUEST);
};

const handleValidationErrorDB = (err) => {
  console.log('handleValidationErrorDB');
  const errors = Object.values(err.errors).map((err) => err.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new APPError(message, StatusCodes.BAD_REQUEST);
};

const handlerJWTError = () =>
  new APPError(`Invalid token, please log in again!`, StatusCodes.UNAUTHORIZED);

const handlerJWTExpiredError = () =>
  new APPError(
    'Your token has expired, please login again!',
    StatusCodes.UNAUTHORIZED
  );

module.exports = (err, req, res, next) => {
  let error = { ...err };
  console.log(error);
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
  if (error.name === 'JsonWebTokenError') error = handlerJWTError();
  if (error.name === 'ExpiredTokenError') error = handlerJWTExpiredError();
  if (process.env.NODE_ENV === 'production') return sendErrProd(res, error);
};
