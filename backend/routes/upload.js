const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Upload file
router.post('/', protect, upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    res.json({
      success: true,
      file: {
        name: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Download file
router.get('/:filename', protect, (req, res) => {
  const filePath = path.join(__dirname, '../uploads', req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
  res.download(filePath);
});

module.exports = router;