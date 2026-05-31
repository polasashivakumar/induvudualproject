const Job = require('./models/Job');

// Add job to queue
const addJob = async (typeOrData, payload = {}, priority) => {
  const jobData = typeof typeOrData === 'object'
    ? typeOrData
    : { ...payload, type: typeOrData, priority };

  const job = await Job.create({
    userId: jobData.userId,
    userName: jobData.userName || '',
    userEmail: jobData.userEmail || '',
    department: jobData.department || '',
    rollNumber: jobData.rollNumber || '',
    type: jobData.type,
    title: jobData.title || jobData.payload?.title || 'Queued Task',
    description: jobData.description || jobData.payload?.description || '',
    priority: jobData.priority || 2,
    dueDate: jobData.dueDate || null,
    templateUsed: jobData.templateUsed || '',
    attachments: jobData.attachments || [],
    auditLog: [{ action: 'queued', by: jobData.userName || 'system', role: 'system', note: 'Queued via helper' }],
    state: 'waiting'
  });
  return job;
};

module.exports = { addJob };