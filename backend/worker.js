const Job = require('./models/Job');

const processJob = async (job) => {
  try {
    await Job.findByIdAndUpdate(job._id, {
      state: 'active',
      attempts: job.attempts + 1
    });

    console.log(`⚙️ Processing [${job.type}]: ${job.title}`);
    await new Promise(res => setTimeout(res, 3000));

    await Job.findByIdAndUpdate(job._id, {
      state: 'completed',
      completedAt: new Date(),
      result: { success: true, processedAt: new Date() }
    });

    console.log(`✅ Completed: ${job.title}`);
  } catch (err) {
    await Job.findByIdAndUpdate(job._id, {
      state: job.attempts >= 3 ? 'failed' : 'waiting',
      failedReason: err.message,
    });
    console.log(`❌ Failed: ${job.title}`);
  }
};

const startWorker = () => {
  console.log('🚀 Worker started...');
  setInterval(async () => {
    try {
      const job = await Job.findOneAndUpdate(
        { state: 'waiting' },
        { state: 'active' },
        { sort: { priority: 1, createdAt: 1 }, returnDocument: 'before' }
      );
      if (job) processJob(job);
    } catch (err) {
      console.error('Worker error:', err.message);
    }
  }, 3000);
};

module.exports = { startWorker };