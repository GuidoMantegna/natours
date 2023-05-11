const mongoose = require('mongoose');
// SCHEMA
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
  }, // schema type options for each field
  rating: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
});

// MODEL
// NAME, SCHEMA - model name (tour) should be with an uppercase "T" as a convention
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;