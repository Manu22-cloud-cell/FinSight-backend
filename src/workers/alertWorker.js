require("dotenv").config();
const connectDB = require("../config/db");

connectDB();

const { Worker } = require("bullmq");
const redis = require("../config/redis");
const emailService = require("../services/emailService");

const alertService = require("../services/alertService");
const userRepository = require("../repositories/userRepository");

const worker = new Worker(
    "alert-queue",
    async (job) => {

        if (job.name === "send-alert") {
            const { email, message, type } = job.data;

            await emailService.sendEmail({
                to: email,
                subject: `FinSight Alert: ${type}`,
                text: message,
            });
        }

        if (job.name === "scheduled-alerts") {
            const users = await userRepository.getAllUsers();

            for (let user of users) {
                await alertService.checkAndCreateAlerts(user._id);
            }
        }
    },
    { connection: redis }
);

worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
    console.error(`Job failed: ${err.message}`);
});