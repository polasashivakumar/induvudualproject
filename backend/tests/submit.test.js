const request = require('supertest');
const express = require('express');
const jobsRouter = require('../routes/jobs');

const app = express();
app.use(express.json());
app.use('/api/jobs', jobsRouter);

describe('Submit route (auth)', () => {
  test('POST /api/jobs/submit should require auth', async () => {
    const res = await request(app).post('/api/jobs/submit').send({ title: 'Test', type: 'assignment' });
    expect(res.statusCode).toBe(401);
  });
});
