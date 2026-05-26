const mongoose = require('mongoose');
const User = require('./models/User');

const test = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/taskqueue');
    console.log('✅ MongoDB Connected');

    const user = await User.create({
      name: 'Test User',
      email: 'test@test.com',
      password: 'password123',
      role: 'admin'
    });

    console.log('✅ User created:', user);
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    mongoose.disconnect();
  }
};

test();