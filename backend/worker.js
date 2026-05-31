const Job = require('./models/Job');

const handlers = {
  assignment: async (job) => `Reviewed assignment: ${job.title}`,
  lab_report: async (job) => `Validated lab report: ${job.title}`,
  project_review: async (job) => `Checked project review: ${job.title}`,
  library_request: async (job) => `Processed library request: ${job.title}`,
  print_request: async (job) => `Processed print request: ${job.title}`,
}

const processJob = async (job, io) => {
  try {
    await Job.findByIdAndUpdate(job._id, {
      state: 'active',
      attempts: job.attempts + 1
    });

    console.log(`⚙️ Processing [${job.type}]: ${job.title}`);
    await new Promise(res => setTimeout(res, 3000));

    const message = handlers[job.type]
      ? await handlers[job.type](job)
      : `Processed ${job.title}`;

    await Job.findByIdAndUpdate(job._id, {
      state: 'completed',
      completedAt: new Date(),
      timeCompleted: new Date(),
      timeSpentMinutes: job.timeStarted
        ? Math.max(1, Math.round((Date.now() - new Date(job.timeStarted).getTime()) / 60000))
        : job.timeSpentMinutes,
      result: { success: true, processedAt: new Date(), message }
    });

    console.log(`✅ Completed: ${job.title}`);
    if (io) io.emit('job:completed', { jobId: job._id, title: job.title, type: job.type });
  } catch (err) {
    await Job.findByIdAndUpdate(job._id, {
      state: job.attempts >= 3 ? 'failed' : 'waiting',
      failedReason: err.message,
    });
    console.log(`❌ Failed: ${job.title}`);
    if (io) io.emit('job:failed', { jobId: job._id, title: job.title, error: err.message });
  }
};

const startWorker = (io) => {
  console.log('🚀 Worker started...');
  let isProcessing = false;
  setInterval(async () => {
    if (isProcessing) return;
    try {
      isProcessing = true;
      const job = await Job.findOneAndUpdate(
        { state: 'waiting' },
        { state: 'active' },
        { sort: { priority: 1, createdAt: 1 }, returnDocument: 'before' }
      );
      if (job) processJob(job, io);
    } catch (err) {
      console.error('Worker error:', err.message);
    } finally {
      isProcessing = false;
    }
  }, 3000);
};

module.exports = { startWorker, processJob };