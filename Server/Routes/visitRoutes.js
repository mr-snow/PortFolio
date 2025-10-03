const express = require('express');
const router = express.Router();
const Visit = require('../db/models/vistorModel');

// Log visit
router.post('/track', async (req, res) => {
  try {
    const visit = new Visit({
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      page: req.body.page,
    });
    await visit.save();

    // Count visits
    const count = await Visit.countDocuments();
    if (count > 30) {
      // Delete all old visits
      await Visit.deleteMany({});
    }

    res.status(200).json({ message: 'Visit logged' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to log visit' });
  }
});

// Get all visits
router.get('/', async (req, res) => {
  try {
    const visits = await Visit.find().sort({ time: -1 });
    res.json(visits);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch visits' });
  }
});

// Delete ONE visit by ID
router.delete('/:id', async (req, res) => {
  try {
    await Visit.findByIdAndDelete(req.params.id);
    res.json({ message: 'Visit deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete visit' });
  }
});

// Delete ALL visits
router.delete('/', async (req, res) => {
  try {
    await Visit.deleteMany({});
    res.json({ message: 'All visits deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete visits' });
  }
});

module.exports = router;
