const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');

router.get('/', async (req, res) => {
  try {
    const { operation, type, q } = req.query;
    const filter = {};

    if (operation) filter.operation = operation;
    if (type) filter.type = type;
    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [
        { title: regex },
        { description: regex },
        { location: regex }
      ];
    }

    const listings = await Listing.find(filter).lean();
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post('/', async (req, res) => {
  try {
    const listing = new Listing(req.body);
    await listing.save();
    res.status(201).json(listing);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

