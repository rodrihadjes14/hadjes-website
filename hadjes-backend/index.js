require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ API Routes
const propertyRoutes = require('./routes/properties');
const listingsRoute = require('./routes/listings');
const Listing = require('./models/Listing');

app.use("/listings", listingsRoute);
app.use('/properties', propertyRoutes);

// ✅ Serve static files from the frontend
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// ✅ Serve listing.html manually
app.get('/listing.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/listing.html'));
});

// ✅ Single Listing by ID (API)
app.get('/listings/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).send('Listing not found');
    }
    res.json(listing);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// ✅ MongoDB Connection + Start Server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });




