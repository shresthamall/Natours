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
reviewSchema.pre('save', function (next) {
  this.constructor().calcAvgRatings(this._id);
  next();
});

// QUERY MIDDLEWARES:
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

// Static functions on Model
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
  console.log(stats);
};

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
