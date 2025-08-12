require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const { upload } = require('./middleware/upload');
const { uploadBuffer } = require('./utils/cloudinary');


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



// Create listing with multiple photos (multipart/form-data)
// Field name for files: "photos"
app.post('/api/listings', upload.array('photos', 20), async (req, res) => {
  try {
    const Listing = require('./models/Listing');

    // Pull text fields (adapt names if your schema differs)
    const {
      title,
      description,
      price,
      location,
      type,
      operation,
      ambientes,
      slug
    } = req.body;

    // Upload all files to Cloudinary, preserving order (first = cover)
    const files = req.files || [];
    const uploads = [];
    for (const f of files) {
      uploads.push(uploadBuffer(f.buffer, 'listings'));
    }
    const results = await Promise.all(uploads);

    // Build images[]
    const images = results.map((img, i) => ({
      url: img.url,
      alt: `${title || 'Listing'} photo ${i + 1}`,
      width: img.width,
      height: img.height,
      isPrimary: i === 0
    }));

    // Backward-compat: keep legacy imageUrl
    let imageUrl;
    if (images.length > 0) {
      imageUrl = images[0].url;
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
      images.push({ url: imageUrl, alt: title || 'Listing', isPrimary: true });
    }

    // Create the listing doc
    const doc = await Listing.create({
      title,
      description,
      price: price ? Number(price) : undefined,
      location,
      type,
      operation,
      ambientes: ambientes ? Number(ambientes) : undefined,
      slug,
      imageUrl,   // legacy single image (still used by your front-end today)
      images      // new multi-image array
    });

    res.status(201).json(doc);
  } catch (err) {
    console.error('Create listing failed:', err);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});


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
const PORT = process.env.PORT || 10000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });




