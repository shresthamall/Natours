const { StatusCodes } = require('http-status-codes');
const Review = require('../models/reviewModel');
const APPError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Get Reviews

// Post Review
exports.createReview = catchAsync(async function (req, res, next) {
  //   //  Get the user document/ID
  //   const userId = req.body.user;

  //   //  Get the tour ID
  //   const tourId = req.body.tour;

  //     //  Get review data
  //     const reviewData
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
  const reviews = await Review.find();

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
