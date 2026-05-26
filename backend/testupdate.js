const mongoose = require('mongoose');
const Job = require('./models/Job');

const test = async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/taskqueue');
  console.log('✅ Connected');

  // Get any job
  const job = await Job.findOne();
  if (!job) {
    console.log('❌ No jobs found!');
    await mongoose.disconnect();
    return;
  }

  console.log('Found job:', job._id, '| state:', job.state);

  // Try updating it
  job.state = 'active';
  job.adminNote = 'Test update';
  await job.save();

  console.log('✅ Update worked! New state:', job.state);
  await mongoose.disconnect();
};

test().catch(console.error);