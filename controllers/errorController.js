/* 
Global error handling function for the app
Is called whenever next(err) is called anywhere/anytime during a process
*/
const { StatusCodes } = require('http-status-codes');

const sendErrorDev = (res, err) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

const sendErrProd = (res, err) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json({ status: 'error', message: 'Uh Oh! Something went wrong!' });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  err.status = err.status || 'error';
  // Operational, trusted error: send message to client
  if (process.env.NODE_ENV === 'development') return sendErrorDev(res, err);

  // Programming or other unknown error: don't leak error details
  if (process.env.NODE_ENV === 'production') return sendErrProd(res, err);
};
