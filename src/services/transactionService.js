const transactionRepo = require("../repositories/transactionRepository");
const alertService = require("./alertService");

exports.addTransaction = async (userId, data) => {
    try {
        // Create transaction
        const transaction = await transactionRepo.createTransaction({
            ...data,
            userId,
        });

        // Trigger alerts AFTER transaction
        await alertService.checkAndCreateAlerts(userId);

        console.log("Triggering alerts for user:", userId);

        return transaction;

    } catch (error) {
        console.error("Error in addTransaction:", error.message);
        throw error;
    }
};

exports.getTransactions = async (userId, filters) => {
    return await transactionRepo.getUserTransactions(userId, filters);
};