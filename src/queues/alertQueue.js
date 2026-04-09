const { Queue } = require("bullmq");
const redis = require("../config/redis");

const alertQueue = new Queue("alert-queue", {
  connection: redis,
});

module.exports = alertQueue;