const { MongoCryptKMSRequestNetworkTimeoutError } = require('mongodb');
const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

// Schema model for mongoose.Schema()
const tourSchemaModel = {
  name: {
    type: String,
    trim: true,
    required: [true, 'A tour must have a name.'],
    unique: true,
    maxlength: [40, 'A tour name must have a maximum of 40 characters'],
    minlength: [5, 'A tour name must have a minimum of 5 characters'],
    // validate: [
    //   validator.isAlpha,
    //   'Name must only contain alphabetic characters',
    // ],
  },
  slug: String,
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty must be either: easy, medium or difficult',
    },
  },
  price: { type: Number, required: [true, 'A tour must have a price.'] },
  priceDiscount: {
    type: Number,
    validate: {
      message: 'Discount prive ({VALUE}) should be lower than price',
      validator: function (value) {
        // this only points to current document on NEW document creation and not on update
        return value < this.price;
      },
    },
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'A rating must have a minimum value of 1.0'],
    max: [5, 'A rating must have a maximum value of 5.0'],
  },
  ratingsQuantity: { type: Number, default: 0 },
  summary: {
    type: String,
    trim: true,
    required: [true, 'A tour must have a summary'],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image.'],
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  startDates: [Date],
  secretTour: {
    type: Boolean,
    default: false,
  },
};

// Schema options
const tourSchemaOptions = {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
};

// Create a schema for tour collection(mongoDB)
const tourSchema = new mongoose.Schema(tourSchemaModel, tourSchemaOptions);

// Add virtual properties to a schema
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Middlewares - Mongoose
// DOCUMENT MIDDLEWARE: runs before .save() and .create() and not on .insertMany(): this points to document being saved
// Creating a slug for each tour being saved - for use in URL
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// // Document middleware: runs after .save() and .create()
// // Gets access to the saved document
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE: this points to the query
// tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function (next) {
  this.find({ $secretTour: { $ne: true } });
  next();
});

// AGGREGATE MIDDLWARE:
// this points to the aggregation object. .pipeline() returns the Pipeline Stage Array containging the aggregation criteria
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

// Create Tour collection
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
