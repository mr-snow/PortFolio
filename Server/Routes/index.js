const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const visitRoutes = require('./visitRoutes');
const authMiddleware = require('../middleWare/authMiddleware');

router.use('/user', userRoutes);
router.use('/visits', visitRoutes);

router.get('/auth/verify', authMiddleware, (req, res) => {
  res.status(200).json({ valid: true, userId: req.userId });
});

module.exports = router;
