const alertRepository = require("../repositories/alertRepository");
const alertEngine = require("./alertEngine");
const alertQueue = require("../queues/alertQueue");
const userRepository = require("../repositories/userRepository");


exports.checkAndCreateAlerts = async (userId) => {
  try {
    const alerts = await alertEngine.runChecks(userId);

    if (!alerts.length) return;

    const user = await userRepository.getUserById(userId);

    for (let alert of alerts) {

      const existing = await alertRepository.getRecentAlert(userId, alert.type);

      // Real-time
      if (global.io) {
        global.io.to(userId.toString()).emit("alert", {
          message: alert.message,
          type: alert.type,
        });
      }

      if (existing) {
        console.log("Skipping duplicate alert:", alert.type);
        continue;
      }

      // Save alert
      await alertRepository.createAlert({
        userId,
        ...alert,
      });

    
      // Background email
      await alertQueue.add(
        "send-alert",
        {
          email: user.email,
          message: alert.message,
          type: alert.type,
          userId,
        },
        {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 5000,
          },
        }
      );
    }
  } catch (error) {
    console.error("Error in checkAndCreateAlerts:", error);
  }
};

exports.getUserAlerts = async (userId) => {
    
    try {
        return await alertRepository.getUserAlerts(userId);
    } catch (error) {
        console.error("Error in getUserAlerts:", error);
        throw error;
    }
};