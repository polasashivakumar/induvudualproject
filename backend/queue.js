const Job = require('./models/Job');

// Add job to queue
const addJob = async (type, payload, priority) => {
  const job = await Job.create({
    type,
    payload,
    priority: priority || 2,
    state: 'waiting'
  });
  return job;
};

module.exports = { addJob };