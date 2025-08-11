const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  url:      { type: String, required: true },
  alt:      { type: String, default: "" },
  width:    { type: Number, default: null },
  height:   { type: Number, default: null },
  isPrimary:{ type: Boolean, default: false }
}, { _id: false });

const ListingSchema = new mongoose.Schema({
  // keep/adjust these to match your current fields
  title:       { type: String, required: true },
  description: { type: String },
  price:       { type: Number },
  location:    { type: String },
  type:        { type: String },     // casa, departamento, etc.
  operation:   { type: String },     // venta, alquiler, temporal
  ambientes:   { type: Number },

  slug:        { type: String, index: true },
  imageUrl:    { type: String },      // legacy single image (kept for UI)
  images:      { type: [ImageSchema], default: [] }
}, { timestamps: true });

// Keep legacy `imageUrl` in sync so existing pages keep working:
ListingSchema.pre('save', function (next) {
  if (this.images?.length) {
    const primary = this.images.find(i => i.isPrimary) || this.images[0];
    this.imageUrl = primary.url;
  }
  next();
});

module.exports = mongoose.model('Listing', ListingSchema);
