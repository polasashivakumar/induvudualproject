const User = require('../models/User');
const Job = require('../models/Job');
const { sendEmail } = require('./emailService');

const buildWeeklyHtml = (name, stats) => `
  <h2>Hi ${name}</h2>
  <p>Here's your weekly task summary:</p>
  <ul>
    <li>Total tasks this week: ${stats.total}</li>
    <li>Completed: ${stats.completed}</li>
    <li>Pending: ${stats.pending}</li>
    <li>Failed: ${stats.failed}</li>
  </ul>
`;

const sendWeeklyReports = async () => {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const students = await User.find({ role: 'student' });
    for (const s of students) {
      const tasks = await Job.find({ userId: s._id, createdAt: { $gte: oneWeekAgo } });
      const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.state === 'completed').length,
        pending: tasks.filter(t => ['waiting', 'active'].includes(t.state)).length,
        failed: tasks.filter(t => t.state === 'failed').length
      };
      await sendEmail({ to: s.email, subject: 'Weekly Task Summary', html: buildWeeklyHtml(s.name, stats) });
    }
    console.log('✅ Weekly reports sent');
  } catch (err) {
    console.error('Weekly reports error:', err.message);
  }
};

module.exports = { sendWeeklyReports };
