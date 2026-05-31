jest.mock('../models/User', () => ({ find: jest.fn() }));
jest.mock('../models/Job', () => ({ find: jest.fn() }));
jest.mock('../utils/emailService', () => ({ sendEmail: jest.fn() }));

const User = require('../models/User');
const Job = require('../models/Job');
const { sendEmail } = require('../utils/emailService');
const { sendWeeklyReports } = require('../utils/scheduler');

describe('sendWeeklyReports', () => {
  afterEach(() => jest.resetAllMocks());

  test('sends weekly summary emails to all students', async () => {
    User.find.mockResolvedValue([
      { _id: 'u1', email: 'alice@example.com', name: 'Alice' },
      { _id: 'u2', email: 'bob@example.com', name: 'Bob' }
    ]);

    Job.find.mockImplementation(({ userId }) => {
      if (userId === 'u1') return Promise.resolve([
        { state: 'completed' }, { state: 'waiting' }
      ]);
      if (userId === 'u2') return Promise.resolve([
        { state: 'failed' }
      ]);
      return Promise.resolve([]);
    });

    sendEmail.mockResolvedValue(true);

    await sendWeeklyReports();

    expect(User.find).toHaveBeenCalledWith({ role: 'student' });
    expect(Job.find).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalledTimes(2);
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: 'alice@example.com', subject: 'Weekly Task Summary' }));
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: 'bob@example.com', subject: 'Weekly Task Summary' }));
  });
});
