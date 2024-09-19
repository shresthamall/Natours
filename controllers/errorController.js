/* 
Global error handling function for the app
Is called whenever next(err) is called anywhere/anytime during a process
*/
const { StatusCodes } = require('http-status-codes');
const APPError = require('../utils/appError');

const sendErrorDev = (res, err) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
  });
};

const sendErrProd = (res, err) => {
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

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  err.status = err.status || 'error';
  // Operational, trusted error: send message to client
  if (process.env.NODE_ENV === 'development') return sendErrorDev(res, err);

  // Programming or other unknown error: don't leak error details
  let error = { ...err };
  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (process.env.NODE_ENV === 'production') return sendErrProd(res, error);
};
