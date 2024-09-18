const express = require('express');
const morgan = require('morgan');
// const exp = require('constants');
const { StatusCodes } = require('http-status-codes/build/cjs/status-codes.js');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log('using morgan - in development');
}

// Middleware: tells app to put received data in req.body argument for post function
app.use(express.json());

// Add routers to app
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Router for invalid URL request
app.all('*', (res, req, _) => {
  next(
    `Cannot find "${req.originalURL}" on this server`,
    StatusCodes.NOT_FOUND
  );
});

// Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
