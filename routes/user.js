const express = require('express');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Activity = require('../models/activity');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// File Upload Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './uploads'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// Register User
router.post('/register', async (req, res) => {
    const { usn, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ usn, password: hashedPassword });
      await newUser.save();
      res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to register user.' });
    }
  });
  
  // User Login
  router.post('/login', async (req, res) => {
    const { usn, password } = req.body;
    try {
      const user = await User.findOne({ usn });
      if (!user) return res.status(404).json({ error: 'User not found.' });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(403).json({ error: 'Invalid credentials.' });
  
      const token = jwt.sign({ id: user._id, usn: user.usn }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } catch (error) {
      res.status(500).json({ error: 'Login failed.' });
    }
  });

// User Dashboard
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const activities = await Activity.find({ userId: req.user.id });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load activities.' });
  }
});

// Add Activity
router.post('/add', authenticateToken, upload.single('certificate'), async (req, res) => {
  const { activityName, activityPoints } = req.body;

  try {
    const newActivity = new Activity({
      userId: req.user.id,
      activityName,
      activityPoints,
      certificatePath: req.file.path,
      status: 'Pending',
      timeline: new Date(),
    });
    await newActivity.save();
    res.status(201).json({ message: 'Activity submitted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add activity.' });
  }
});

module.exports = router;
