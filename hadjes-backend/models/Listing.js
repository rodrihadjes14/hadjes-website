const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  location: String,
  imageUrl: String,
});

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;

