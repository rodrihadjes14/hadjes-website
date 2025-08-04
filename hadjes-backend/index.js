require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // ✅ Needed for serving HTML

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Connect Routes
const propertyRoutes = require('./routes/properties');
const listingsRoute = require('./routes/listings');
const Listing = require('./models/Listing');

app.use("/listings", listingsRoute);
app.use('/properties', propertyRoutes);

// ✅ Serve Frontend Static Files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../hadjes-propiedades-main')));

// ✅ Route: Serve Homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../hadjes-propiedades-main/index.html'));
});

// ✅ Route: Serve Listing Page
app.get('/listing.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../hadjes-propiedades-main/listing.html'));
});

// ✅ Route: API - Single Listing by ID
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

// ✅ Start Server After Connecting to MongoDB
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ MongoDB connected');
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});



