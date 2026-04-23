const alertRepository = require("../repositories/alertRepository");
const alertEngine = require("./alertEngine");
const alertQueue = require("../queues/alertQueue");
const userRepository = require("../repositories/userRepository");
const AppError = require("../utils/AppError");


// ================= CHECK & CREATE ALERTS =================
exports.checkAndCreateAlerts = async (userId) => {
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  const alerts = await alertEngine.runChecks(userId);

  if (!alerts || !alerts.length) return;

  const user = await userRepository.getUserById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Process alerts in parallel (performance improvement)
  await Promise.all(
    alerts.map(async (alert) => {
      const existing = await alertRepository.getRecentAlert(
        userId,
        alert.type
      );

      if (existing) {
        console.log("Skipping duplicate alert:", alert.type);
        return;
      }

      // Real-time notification
      if (global.io) {
        global.io.to(userId.toString()).emit("alert", {
          message: alert.message,
          type: alert.type,
        });
      }

      // Save alert
      await alertRepository.createAlert({
        userId,
        ...alert,
      });

      // Background email (queue)
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
    })
  );
};


// ================= GET ALERTS =================
exports.getUserAlerts = async (userId) => {
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  return await alertRepository.getUserAlerts(userId);
};