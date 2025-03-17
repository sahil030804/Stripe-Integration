const { Worker } = require('bullmq');
const config = require('../config/config');
const webhookHelper = require('../utils/webhookHelper');

const paymentProcessWorker = new Worker(
  'paymentProcessQueue',
  async (job) => {
    await webhookHelper.addPaymentDataInDb(job.data.event);
  },
  {
    connection: {
      host: config.redis.REDIS_HOST,
      port: config.redis.REDIS_PORT,
      password: config.redis.REDIS_PASSWORD,
    },
    lockDuration: 30000,
    lockRenewTime: 10000,
    concurrency: 1,
  }
);

// Process job worker log
paymentProcessWorker.on('active', (job) => {
  console.log(
    `Job ${job.id} is currently being processed by worker: ${paymentProcessWorker.name}`
  );
});

paymentProcessWorker.on('completed', (job) => {
  console.error(`Job ${job.id} completed`);
});

paymentProcessWorker.on('failed', (job, err) => {
  console.log(`Job ${job.id} failed: ${err}`);
});

paymentProcessWorker.on('progress', (job, progress) => {
  console.log(`Job ${job.id} is in progress ${progress}`);
});

module.exports = { paymentProcessWorker };
