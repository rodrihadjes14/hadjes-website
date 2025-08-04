const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: String,
  location: String,
  type: String,
  operation: String,
  price: Number,
  size: Number,
  bedrooms: Number,
  bathrooms: Number,
  address: String,
  images: [String],
  description: String,
  keywords: [String],
}, {
  timestamps: true
});

module.exports = mongoose.model('Property', propertySchema);

