const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email not configured — skipping');
      return false;
    }
    await transporter.sendMail({
      from: `"College Task Queue" <${process.env.EMAIL_USER}>`,
      to, subject, html
    });
    console.log(`✅ Email sent to ${to}`);
    return true;
  } catch (err) {
    console.error('Email error:', err.message);
    return false;
  }
};

const taskStatusEmail = (studentName, taskTitle, status, adminNote) => `
<!DOCTYPE html>
<html>
<body style="font-family: Inter, sans-serif; background: #030712; color: #fff; padding: 32px;">
  <div style="max-width: 500px; margin: 0 auto; background: #111827; border-radius: 16px; padding: 32px; border: 1px solid rgba(255,255,255,0.1);">
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="font-size: 40px;">⚡</div>
      <h1 style="color: #a78bfa; font-size: 20px; margin: 8px 0;">College Task Queue</h1>
    </div>
    <h2 style="color: #fff; font-size: 18px;">Hi ${studentName}!</h2>
    <p style="color: #9ca3af;">Your task status has been updated:</p>
    <div style="background: rgba(124,58,237,0.1); border: 1px solid rgba(124,58,237,0.2); border-radius: 10px; padding: 16px; margin: 16px 0;">
      <p style="color: #fff; font-weight: 700; margin: 0 0 8px;">📋 ${taskTitle}</p>
      <p style="color: ${status === 'completed' ? '#10b981' : status === 'failed' ? '#ef4444' : '#3b82f6'}; font-weight: 700; margin: 0;">
        Status: ${status.toUpperCase()}
      </p>
    </div>
    ${adminNote ? `
    <div style="background: rgba(255,255,255,0.05); border-radius: 10px; padding: 14px; margin: 16px 0;">
      <p style="color: #a78bfa; margin: 0 0 4px; font-size: 12px;">Admin Feedback:</p>
      <p style="color: #e5e7eb; margin: 0;">${adminNote}</p>
    </div>` : ''}
    <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 24px;">
      Login to view your tasks at College Task Queue
    </p>
  </div>
</body>
</html>
`;

const approvalEmail = (studentName, taskTitle, status, reason) => `
<!DOCTYPE html>
<html>
<body style="font-family: Inter, sans-serif; background: #030712; color: #fff; padding: 32px;">
  <div style="max-width: 500px; margin: 0 auto; background: #111827; border-radius: 16px; padding: 32px; border: 1px solid rgba(255,255,255,0.1);">
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="font-size: 40px;">${status === 'approved' ? '✅' : '❌'}</div>
      <h1 style="color: #a78bfa; font-size: 20px; margin: 8px 0;">Task ${status === 'approved' ? 'Approved' : 'Rejected'}</h1>
    </div>
    <h2 style="color: #fff; font-size: 18px;">Hi ${studentName}!</h2>
    <p style="color: #9ca3af;">Your task submission has been ${status}:</p>
    <div style="background: rgba(124,58,237,0.1); border-radius: 10px; padding: 16px; margin: 16px 0;">
      <p style="color: #fff; font-weight: 700; margin: 0;">📋 ${taskTitle}</p>
    </div>
    ${reason ? `<p style="color: #9ca3af;">Reason: <span style="color: #e5e7eb;">${reason}</span></p>` : ''}
  </div>
</body>
</html>
`;

module.exports = { sendEmail, taskStatusEmail, approvalEmail };