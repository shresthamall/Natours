// review / rating / createdAt / Ref to tour / ref to user
const mongoose = require('mongoose');
const Tour = require('./tourModel');
const APPError = require('../utils/appError');
const { StatusCodes } = require('http-status-codes');

const reviewSchemaModel = {
  review: {
    type: String,
    required: [true, 'Review cannot be empty!'],
  },
  rating: {
    type: Number,
    max: 5,
    min: 0,
    message: 'Ratings must have a value between 0 and 5',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Review must belong to a tour!'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a user!'],
  },
};

const reviewSchemaOptions = {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
};

const reviewSchema = new mongoose.Schema(
  reviewSchemaModel,
  reviewSchemaOptions
);

//// Indexes
// Prevent users from posting multiple reviews for one tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// MIDDLEWARES:
// DOCUMENT MIDDLEWARES:
// Update ratingsAverage and ratingsQuantity when new review is added, on the particular tour
reviewSchema.post('save', function () {
  this.constructor.calcAvgRatings(this.tour);
});

// QUERY MIDDLEWARES:
// Update ratingsAverage and ratingsQuantity when review is updated/deleted
reviewSchema.post(/^findOneAnd/, async function (review) {
  if (!review)
    throw new APPError(
      `No document found with that ID.`,
      StatusCodes.NOT_FOUND
    );
  review.constructor.calcAvgRatings(review.tour);
});

// Populate user fields before returning results. Populating tour field will create 3 level deep nested populates. Leaving the tour.id in place as a parent reference instead
reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // });
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

//// Static functions on Model
reviewSchema.statics.calcAvgRatings = async function (tourId) {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 0,
      ratingsQuantity: 4.5,
    });
  }
};

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
