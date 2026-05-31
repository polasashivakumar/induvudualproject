const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ pinned: -1, createdAt: -1 })
      .limit(50);

    // include per-user read flag
    const mapped = announcements.map(a => {
      const obj = a.toObject();
      obj.read = Array.isArray(a.readBy) && req.user
        ? a.readBy.some(id => id.toString() === req.user._id.toString())
        : false;
      return obj;
    });
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { title, message, type, pinned } = req.body;
    if (!title || !message) return res.status(400).json({ error: 'Required fields missing' });
    const a = await Announcement.create({
      title, message,
      type: type || 'info',
      pinned: pinned || false,
      createdBy: req.user.name
    });
    // emit realtime announcement to connected clients
    try { req.app.locals.io?.emit('announcement:new', a); } catch (e) {}
    res.json({ success: true, announcement: a });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/pin', protect, adminOnly, async (req, res) => {
  try {
    const a = await Announcement.findById(req.params.id);
    if (!a) return res.status(404).json({ error: 'Not found' });
    a.pinned = !a.pinned;
    await a.save();
    res.json({ success: true, pinned: a.pinned });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark announcement as read by current user
router.put('/:id/read', protect, async (req, res) => {
  try {
    await Announcement.findByIdAndUpdate(req.params.id, {
      $addToSet: { readBy: req.user._id }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;