// review / rating / createdAt / Ref to tour / ref to user
const mongoose = require('mongoose');

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

// MIDDLEWARES:
// DOCUMENT MIDDLEWARES:

// QUERY MIDDLEWARES:
// Populate tour and user fields before returning results
reviewSchema.pre(/^find/, function (next) {
  //   this.populate({
  //     path: 'tour',
  //     select: 'name',
  //   }).populate({
  //     path: 'user',
  //     select: 'name photo',
  //   });
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
