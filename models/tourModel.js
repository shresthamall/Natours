const mongoose = require('mongoose');

// Schema options for mongoose.Schema()
const tourSchemaOptions = {
  name: {
    type: String,
    required: [true, 'A tour must have a name.'],
    unique: true,
  },
  price: { type: Number, required: [true, 'A tour must have a price.'] },
  rating: { type: Number, default: 4.5 },
};

// Create a schema for tour collection(mongoDB)
const tourSchema = new mongoose.Schema(tourSchemaOptions);

// Create Tour collection
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
