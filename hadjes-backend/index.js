require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const { upload } = require('./middleware/upload');
const { uploadBuffer } = require('./utils/cloudinary');

const app = express();

// Trust Render/Cloudflare proxy headers so req.secure works
app.set('trust proxy', 1);


// ✅ Middleware
app.use(cors());
app.use(express.json());


app.use((req, res, next) => {
  const host = (req.headers.host || '').toLowerCase();
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
  const targetHost = 'www.hadjes.com.ar';

  // If someone hits any non-HTTPS URL, send them to HTTPS on your primary host
  if (!isHttps) {
    return res.redirect(301, `https://${targetHost}${req.originalUrl}`);
  }

  // If someone hits the bare apex over HTTPS, send them to www
  if (host === 'hadjes.com.ar') {
    return res.redirect(301, `https://${targetHost}${req.originalUrl}`);
  }

  // If someone hits the Render subdomain, also send them to www
  if (host.endsWith('.onrender.com')) {
    return res.redirect(301, `https://${targetHost}${req.originalUrl}`);
  }

  next();
});




// ✅ API Routes
const propertyRoutes = require('./routes/properties');
const listingsRoute = require('./routes/listings');
const Listing = require('./models/Listing');

app.use('/listings', listingsRoute);
app.use('/properties', propertyRoutes);

// ✅ Create listing (multiple photos)
app.post('/api/listings', upload.array('photos', 20), async (req, res) => {
  try {
    const {
      title, description, price, location, type, operation, ambientes, slug
    } = req.body;

    const files = req.files || [];
    const uploads = [];
    for (const f of files) uploads.push(uploadBuffer(f.buffer, 'listings'));
    const results = await Promise.all(uploads);

    const images = results.map((img, i) => ({
      url: img.url,
      alt: `${title || 'Listing'} photo ${i + 1}`,
      width: img.width,
      height: img.height,
      isPrimary: i === 0
    }));

    let imageUrl;
    if (images.length > 0) imageUrl = images[0].url;
    else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
      images.push({ url: imageUrl, alt: title || 'Listing', isPrimary: true });
    }

    const doc = await Listing.create({
      title,
      description,
      price: price ? Number(price) : undefined,
      location,
      type,
      operation,
      ambientes: ambientes ? Number(ambientes) : undefined,
      slug,
      imageUrl,
      images
    });

    res.status(201).json(doc);
  } catch (err) {
    console.error('Create listing failed:', err);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// ✅ Update listing (text-only)
app.put('/api/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const allowed = ['title', 'description', 'price', 'location', 'type', 'operation', 'ambientes', 'slug'];
    const update = {};

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        if (key === 'price' || key === 'ambientes') {
          const raw = req.body[key];
          if (raw !== '' && raw !== null) {
            const num = Number(raw);
            if (!Number.isNaN(num)) update[key] = num;
          }
        } else {
          update[key] = req.body[key];
        }
      }
    }
    for (const k of Object.keys(update)) if (update[k] === undefined) delete update[k];

    const doc = await Listing.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ error: 'Listing not found' });
    res.json(doc);
  } catch (err) {
    console.error('Update listing failed:', err);
    res.status(500).json({ error: 'Failed to update listing' });
  }
});


// ✅ DELETE LISTING
app.delete('/api/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Listing.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Listing not found' });
    res.status(204).send(); // No content, but successful
  } catch (err) {
    console.error('Delete listing failed:', err);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});


// DEBUG: list registered routes (remove later)
app.get('/__routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach(layer => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
      routes.push(`${methods} ${layer.route.path}`);
    }
  });
  res.json(routes);
});

// ✅ Static + HTML
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.get('/listing.html', (req, res) => res.sendFile(path.join(__dirname, 'public/listing.html')));

// ✅ Single Listing by ID (API)
app.get('/listings/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).send('Listing not found');
    res.json(listing);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// ✅ MongoDB connect + start
const PORT = process.env.PORT || 10000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
