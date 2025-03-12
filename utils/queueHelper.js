const { Queue } = require("bullmq");
const config = require("../config/config");
const { createBullBoard } = require("@bull-board/api");
const { BullMQAdapter } = require("@bull-board/api/bullMQAdapter.js"); // Use BullMQAdapter instead of BullAdapter
const { ExpressAdapter } = require("@bull-board/express");

const paymentProcessQueue = new Queue("paymentProcessQueue", {
  connection: {
    host: config.redis.REDIS_HOST,
    port: config.redis.REDIS_PORT,
    // password: config.redis.REDIS_PASSWORD,
  },
});

//import logs
paymentProcessQueue.on("waiting", ({ id }) => {
  console.log(`import Job ${id} is waiting in the queue`);
});

paymentProcessQueue.on("failed", ({ id, failedReason }) => {
  console.error(`import Job ${id} failed due to: ${failedReason}`);
});

paymentProcessQueue.on("completed", ({ id }) => {
  console.log(`import Job ${id} completed`);
});

paymentProcessQueue.on("paused", ({ id }) => {
  console.log(`import Job ${id} paused`);
});

class Queues {
  async paymentProcessJob(event) {
    const job = await paymentProcessQueue.add(
      "paymentProcessJob",
      { event },
      { attempts: 5, removeOnComplete: { age: 10 }, removeOnFail: 5 }
    );
    return job;
  }
}
// Create Express Adapter for UI
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

// Initialize Bull-Board with BullMQ
createBullBoard({
  queues: [new BullMQAdapter(paymentProcessQueue)], // ✅ Fix: Use BullMQAdapter
  serverAdapter,
});

const queues = new Queues();

module.exports = { queues, serverAdapter, paymentProcessQueue };
