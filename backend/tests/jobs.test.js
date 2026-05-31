const request = require('supertest');
const express = require('express');
const jobsRouter = require('../routes/jobs');

// lightweight app for route testing
const app = express();
app.use(express.json());
app.use('/api/jobs', jobsRouter);

describe('Jobs routes (unauthenticated)', () => {
  test('GET /api/jobs/my should require auth', async () => {
    const res = await request(app).get('/api/jobs/my');
    expect(res.statusCode).toBe(401);
  });
});
