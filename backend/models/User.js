const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const badgeSchema = new mongoose.Schema({
  id: String,
  name: String,
  icon: String,
  earnedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  department: { type: String, default: '' },
  rollNumber: { type: String, default: '' },
  role: { type: String, enum: ['admin', 'student'], default: 'student' },
  badges: [badgeSchema],
  weeklyReport: {
    lastSent: { type: Date, default: null },
    totalCompleted: { type: Number, default: 0 }
  }
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);