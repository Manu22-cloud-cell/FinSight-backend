const alertRepository = require("../repositories/alertRepository");
const alertEngine = require("./alertEngine");
const alertQueue = require("../queues/alertQueue");
const userRepository = require("../repositories/userRepository");


exports.checkAndCreateAlerts = async (userId) => {

    try {

        const alerts = await alertEngine.runChecks(userId);
        const user = await userRepository.getUserById(userId);

        for (let alert of alerts) {

            // Prevent duplicate alerts (last 1 hour)
            const existing = await alertRepository.getRecentAlert(userId, alert.type);
            if (existing) {
                console.log("Skipping duplicate alert:", alert.type);
                continue;
            }

            // Save alert in DB
            const savedAlert = await alertRepository.createAlert({
                userId,
                ...alert,
            });

            // Real-time socket emit (CORRECT PLACE)
            if (global.io) {
                global.io.to(userId.toString()).emit("alert", {
                    message: alert.message,
                    type: alert.type,
                });
            }

            // Push to BullMQ queue (email handled in worker)
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