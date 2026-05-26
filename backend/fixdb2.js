const mongoose = require('mongoose');

const fix = async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/taskqueue');
  console.log('✅ Connected');

  try {
    // Drop entire jobs collection and recreate fresh
    await mongoose.connection.collection('jobs').drop();
    console.log('✅ Jobs collection dropped and will recreate fresh!');
  } catch (err) {
    console.log('⚠️', err.message);
  }

  try {
    // Also drop all indexes
    await mongoose.connection.collection('jobs').dropIndexes();
    console.log('✅ All indexes dropped!');
  } catch (err) {
    console.log('⚠️', err.message);
  }

  await mongoose.disconnect();
  console.log('✅ Done! Restart server now.');
};

fix();