const mongoose = require('mongoose');

const fix = async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/taskqueue');
  console.log('✅ Connected');

  try {
    await mongoose.connection.collection('jobs').dropIndex('jobId_1');
    console.log('✅ Old jobId index dropped!');
  } catch (err) {
    console.log('⚠️ Index not found (already clean):', err.message);
  }

  await mongoose.disconnect();
  console.log('✅ Done! Now restart your server.');
};

fix();