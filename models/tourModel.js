const mongoose = require('mongoose');

// Schema options for mongoose.Schema()
const tourSchemaOptions = {
  name: {
    type: String,
    trim: true,
    required: [true, 'A tour must have a name.'],
    unique: true,
  },
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
  },
  price: { type: Number, required: [true, 'A tour must have a price.'] },
  priceDiscount: Number,
  ratingsAverage: { type: Number, default: 4.5 },
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
};

// Create a schema for tour collection(mongoDB)
const tourSchema = new mongoose.Schema(tourSchemaOptions);

// Create Tour collection
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
