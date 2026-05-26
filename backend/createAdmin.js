const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const run = async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/taskqueue');
  console.log('✅ Connected');

  const existing = await mongoose.connection.collection('users').findOne({ email: 'admin@123' });
  if (existing) {
    console.log('⚠️ Admin already exists!');
    await mongoose.disconnect();
    return;
  }

  const password = await bcrypt.hash('admin@123', 10);
  await mongoose.connection.collection('users').insertOne({
    name: 'Admin',
    email: 'admin@123',
    password,
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  console.log('✅ Admin created!');
  console.log('Email: admin@123');
  console.log('Password: admin@123');
  await mongoose.disconnect();
};

run();