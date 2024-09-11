const express = require('express');
const morgan = require('morgan');
const exp = require('constants');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log('using morgan - in development');
}

// Middleware: tells app to put received data in request argument for post function
app.use(express.json());

// Add routers to app
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
