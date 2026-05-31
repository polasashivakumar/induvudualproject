const { processJob } = require('../worker');
const Job = require('../models/Job');

jest.mock('../models/Job', () => ({
  findByIdAndUpdate: jest.fn(),
}));

describe('worker.processJob', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('completes a job and emits job:completed', async () => {
    const job = {
      _id: 'job1',
      title: 'Test Job',
      type: 'assignment',
      attempts: 0,
      timeStarted: new Date(Date.now() - 2 * 60000).toISOString(),
      timeSpentMinutes: 0,
    };

    // allow updates to succeed
    Job.findByIdAndUpdate.mockResolvedValue({});

    // make timers immediate to avoid waiting 3s
    const realSetTimeout = global.setTimeout;
    global.setTimeout = (fn) => fn();

    const io = { emit: jest.fn() };
    await processJob(job, io);

    expect(Job.findByIdAndUpdate).toHaveBeenCalled();
    expect(io.emit).toHaveBeenCalledWith('job:completed', expect.objectContaining({ jobId: job._id }));

    global.setTimeout = realSetTimeout;
  });

  test('handles failure and emits job:failed', async () => {
    const job = { _id: 'job2', title: 'Fail Job', type: 'assignment', attempts: 3, timeSpentMinutes: 0 };

    // first update (set active) resolves, second update (complete) rejects, third update (mark failed) resolves
    Job.findByIdAndUpdate
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new Error('DB write failure'))
      .mockResolvedValueOnce({});

    const realSetTimeout = global.setTimeout;
    global.setTimeout = (fn) => fn();

    const io = { emit: jest.fn() };
    await processJob(job, io);

    expect(Job.findByIdAndUpdate).toHaveBeenCalled();
    expect(io.emit).toHaveBeenCalledWith('job:failed', expect.objectContaining({ jobId: job._id }));

    global.setTimeout = realSetTimeout;
  });
});
