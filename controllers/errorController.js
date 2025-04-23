/* 
Global error handling function for the app
Is called whenever next(err) is called anywhere/anytime during a process
*/
const { StatusCodes } = require('http-status-codes');
const APPError = require('../utils/appError');

const sendErrorDev = (req, res, err) => {
  console.log('Logging error from development', err);
  // A) API accessed, return json
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  }
  // B) Rendered website accessed, render html
  res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    message: err.message,
  });
};

const sendErrProd = (req, res, err) => {
  console.log('Logging error from production');
  // A) API accessed, return json
  if (req.originalUrl.startsWith('/api')) {
    // A.1) Operational, trusted error: send message to client
    if (err.isOperational) {
      console.log('prod:isOperational/////', err);
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // A.2) Programming or other unknown error: don't leak error details
    // A.2.1) Log error
    console.error('Error 💥', err);
    // A.2.2) Send generic message to client
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Uh Oh! Something went wrong!',
    });
  }
  // B) Rendered website accessed, render html
  // B.1) Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      message: err.message,
    });
  }
  // B.2) Programming or other unknown error: don't leak error details
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    message: 'Please try again later!',
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

const handleJSONParseError = () => {
  return new APPError(
    'SignUp Data could not be parsed. Please try again later!',
    StatusCodes.INTERNAL_SERVER_ERROR
  );
};

const handleUndefinedRoute = () =>
  new APPError(
    'This route is not defined. Please check the route again',
    StatusCodes.NOT_FOUND
  );

const handleDuplicateReviewError = () =>
  new APPError(
    `A user can only post one review for each tour.`,
    StatusCodes.BAD_REQUEST
  );

module.exports = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  if (typeof err === `string` && err.includes(`Cannot find "undefined"`))
    error = handleUndefinedRoute(error);
  // console.log(`Logging from global error hanndler: 💥💥💥💥`, typeof err);
  error.statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  error.status = err.status || 'error';
  // Operational, trusted error: send message to client
  if (process.env.NODE_ENV === 'development')
    return sendErrorDev(req, res, error);

  // Programming or other unknown error: don't leak error details
  // if (error.name === 'CastError') error = handleCastErrorDB(error);
  console.log(error);
  if (error.kind === 'ObjectId') error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateKeyDB(error);
  if (/validation failed/.test(error._message))
    error = handleValidationErrorDB(error);
  if (error.name === 'JsonWebTokenError') error = handlerJWTError();
  if (error.name === 'ExpiredTokenError') error = handlerJWTExpiredError();
  if (error.type === 'entity.parse.failed') error = handleJSONParseError();
  if (error.errmsg && error.errmsg.includes(/tour_1_user_1/))
    error = handleDuplicateReviewError();
  if (process.env.NODE_ENV === 'production')
    return sendErrProd(req, res, error);
};
