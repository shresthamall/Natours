const { StatusCodes } = require('http-status-codes');
const Review = require('../models/reviewModel');
const APPError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Get Reviews

// Post Review
exports.createReview = catchAsync(async function (req, res, next) {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  const review = await Review.create(req.body);

  if (!review)
    return next(
      new APPError('Could not create review', StatusCodes.BAD_REQUEST)
    );

  res.status(StatusCodes.CREATED).json({
    status: 'success',
    data: {
      review,
    },
  });
});

exports.getAllReviews = catchAsync(async function (req, res, next) {
  const tour = {};
  req.params.tourId ? (tour.tour = req.params.tourId) : '';
  //   const { tourId } = req.params;
  //   const reviews = await Review.find(tourId ? { tour: tourId } : {});
  const reviews = await Review.find(tour);

  if (!reviews)
    return next(
      new APPError('There are currently no reviews', StatusCodes.BAD_REQUEST)
    );

  res.status(StatusCodes.OK).json({
    status: 'success',
    data: {
      reviews,
    },
  });
});
