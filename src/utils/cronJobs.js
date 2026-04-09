const cron = require("node-cron");
const alertService = require("../services/alertService");
const userRepository = require("../repositories/userRepository");

cron.schedule("0 * * * *", async () => {
  console.log("Running scheduled alert checks at:", new Date());

  const users = await userRepository.getAllUsers();

  for (let user of users) {
    await alertService.checkAndCreateAlerts(user._id);
  }

});