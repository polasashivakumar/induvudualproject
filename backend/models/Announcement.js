const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['info', 'warning', 'success', 'urgent'],
    default: 'info'
  },
  createdBy: { type: String },
  pinned: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);