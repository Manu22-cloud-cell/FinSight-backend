const alertQueue = require("./alertQueue");

const setupRepeatableJobs = async () => {
  console.log("Setting up scheduled jobs...");
  await alertQueue.add(
    "scheduled-alerts",
    {},
    {
      repeat: {
        pattern: "0 * * * *", // every hour
      },
    }
  );
};

module.exports = setupRepeatableJobs;