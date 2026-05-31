jest.mock('../middleware/auth', () => ({
  protect: (req, res, next) => {
    req.user = { _id: 'user1', name: 'Test User', email: 'test@example.com', role: 'student' };
    next();
  },
  adminOnly: (req, res, next) => next()
}));

jest.mock('../models/Job');

const request = require('supertest');
const express = require('express');
const Job = require('../models/Job');

const jobsRouter = require('../routes/jobs');

const app = express();
app.use(express.json());
app.use('/api/jobs', jobsRouter);

describe('Jobs flow (mocked)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('Authenticated submit creates job', async () => {
    Job.create.mockResolvedValue({ _id: 'job123' });

    const res = await request(app)
      .post('/api/jobs/submit')
      .send({ type: 'assignment', title: 'Test Task' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('jobId', 'job123');
    expect(Job.create).toHaveBeenCalled();
  });

  test('Submit validation rejects missing fields', async () => {
    const res = await request(app)
      .post('/api/jobs/submit')
      .send({ title: '' });

    expect(res.statusCode).toBe(400);
  });
});
