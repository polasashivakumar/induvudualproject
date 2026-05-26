const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const DEPARTMENTS = ['IT', 'CSE', 'ECE', 'EEE', 'AIML', 'DS'];

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'fallbacksecret123', { expiresIn: '7d' });

// Register
router.post('/register', async (req, res) => {
  console.log('Register hit:', req.body);
  try {
    const { name, email, password, department, rollNumber } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email and password are required' });

    if (department && !DEPARTMENTS.includes(department.toUpperCase()))
      return res.status(400).json({ error: 'Invalid department' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });

    const user = await User.create({
      name, email, password,
      department: department?.toUpperCase() || '',
      rollNumber: rollNumber || '',
      role: 'student'
    });

    console.log('✅ Student registered:', user.email);
    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id, name: user.name,
        email: user.email, role: user.role,
        department: user.department,
        rollNumber: user.rollNumber
      }
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const match = await user.matchPassword(password);
    if (!match) return res.status(400).json({ error: 'Invalid email or password' });

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id, name: user.name,
        email: user.email, role: user.role,
        department: user.department,
        rollNumber: user.rollNumber
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, department, rollNumber } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, department: department?.toUpperCase(), rollNumber },
      { new: true }
    ).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/profile', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;