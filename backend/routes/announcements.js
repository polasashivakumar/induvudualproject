const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect, adminOnly } = require('../middleware/auth');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'success', 'urgent'], default: 'info' },
  createdBy: { type: String },
}, { timestamps: true });

const Announcement = mongoose.model('Announcement', announcementSchema);

// Get all
router.get('/', protect, async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 }).limit(20);
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post (admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { title, message, type } = req.body;
    if (!title || !message) return res.status(400).json({ error: 'Title and message required' });
    const a = await Announcement.create({ title, message, type, createdBy: req.user.name });
    res.json({ success: true, announcement: a });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;