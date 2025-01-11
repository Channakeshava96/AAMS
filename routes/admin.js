const express = require('express');
const Activity = require('../models/activity');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register Admin
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newAdmin = new Admin({ email, password: hashedPassword });
      await newAdmin.save();
      res.status(201).json({ message: 'Admin registered successfully.' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to register admin.' });
    }
  });
  
  // Admin Login
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const admin = await Admin.findOne({ email });
      if (!admin) return res.status(404).json({ error: 'Admin not found.' });
  
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) return res.status(403).json({ error: 'Invalid credentials.' });
  
      const token = jwt.sign({ id: admin._id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } catch (error) {
      res.status(500).json({ error: 'Login failed.' });
    }
  });

// Admin Dashboard
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const activities = await Activity.find({ status: 'Pending' });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load activities.' });
  }
});

// Approve Activity
router.post('/approve/:id', authenticateToken, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    activity.status = 'Accepted';
    await activity.save();
    res.status(200).json({ message: 'Activity approved successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve activity.' });
  }
});

module.exports = router;
