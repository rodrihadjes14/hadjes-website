const express = require('express');
const router = express.Router();
const Property = require('../models/Property');

// GET /properties (with optional filters)
router.get('/', async (req, res) => {
  try {
    const query = {};

    if (req.query.location) {
      query.location = { $regex: req.query.location, $options: 'i' };
    }

    if (req.query.type) {
      query.type = req.query.type;
    }

    if (req.query.operation) {
      query.operation = req.query.operation;
    }

    const properties = await Property.find(query);
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /properties (to add a new listing)
router.post('/', async (req, res) => {
  try {
    const newProperty = new Property(req.body);
    await newProperty.save();
    res.status(201).json(newProperty);
  } catch (err) {
    res.status(400).json({ error: 'Error saving property' });
  }
});

module.exports = router;

