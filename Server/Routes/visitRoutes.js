const express = require('express');
const router = express.Router();
const Visit = require('../db/models/vistorModel');

// Log visit (normal user)
router.post('/track', async (req, res) => {
  try {
    const { userId, page } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const visit = await Visit.create({
      userId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      page,
    });

    // Keep only latest 30 visits per user
    const count = await Visit.countDocuments({ userId });
    if (count > 30) {
      const oldest = await Visit.find({ userId }).sort({ time: 1 }).limit(count - 30);
      await Visit.deleteMany({ _id: { $in: oldest.map(v => v._id) } });
    }

    res.status(201).json({ message: 'Visit logged', data: visit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to log visit' });
  }
});


// Get visits for a specific user
router.get('/:userId', async (req, res) => {
  try {
    const visits = await Visit.find({ userId: req.params.userId }).sort({ time: -1 });
    res.json(visits);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch visits' });
  }
});

// Delete a single visit
router.delete('/:userId/:visitId', async (req, res) => {
  try {
    await Visit.findOneAndDelete({ _id: req.params.visitId, userId: req.params.userId });
    res.json({ message: 'Visit deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete visit' });
  }
});

// Delete all visits for a user
router.delete('/:userId', async (req, res) => {
  try {
    await Visit.deleteMany({ userId: req.params.userId });
    res.json({ message: 'All visits deleted for this user' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete visits' });
  }
});

module.exports = router;
