const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const { StatusCodes } = require('http-status-codes/build/cjs/status-codes.js');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// Express application
const app = express();

// Set security HTTP headers
app.use(helmet());

// Morgan Logger - Logging for development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log('using morgan - in development');
}

// GLOBAL MIDDLEWARE FUNCTIONS

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
// Limit calls from same API
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NOSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS - cross site scripting
app.use(xss());

// Prevent parameter pollution
// Whitelisted parameters
const whiteListedParams = [
  'duration',
  'ratingsQuantity',
  'ratingsAverage',
  'maxGroupSize',
  'difficulty',
  'price',
];
app.use(
  hpp({
    whitelist: whiteListedParams,
  })
);

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Add timestamp for request
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// Add routers to app
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Router for invalid URL request
app.all('*', (req, res, next) => {
  next(
    `Cannot find "${req.originalURL}" on this server`,
    StatusCodes.NOT_FOUND
  );
});

// Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
