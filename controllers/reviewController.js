const { StatusCodes } = require('http-status-codes');
const Review = require('../models/reviewModel');
const APPError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// exports.getAllReviews = catchAsync(async function (req, res, next) {
//   const tour = {};
//   req.params.tourId ? (tour.tour = req.params.tourId) : '';
//   //   const { tourId } = req.params;
//   //   const reviews = await Review.find(tourId ? { tour: tourId } : {});
//   const reviews = await Review.find(tour);

//   if (!reviews)
//     return next(
//       new APPError('There are currently no reviews', StatusCodes.BAD_REQUEST)
//     );

//   res.status(StatusCodes.OK).json({
//     status: 'success',
//     data: {
//       reviews,
//     },
//   });
// });

//// Post/Create Review
// Add tourId and userId to req.body => Compensate for nested route through tourRouter
exports.addReviewTourIdUserId = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

// Get All reviews
exports.getAllReviews = factory.getAll(Review);

// Create review
exports.createReview = factory.createOne(Review);

// Update review
exports.updateReview = factory.updateOne(Review);

// Delete review
exports.deleteReview = factory.deleteOne(Review);
