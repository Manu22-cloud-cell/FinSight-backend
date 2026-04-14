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

exports.updateTransaction = async (userId, transactionId, data) => {
    try {
        const updatedTransaction =
            await transactionRepo.updateTransaction(
                userId,
                transactionId,
                data
            );

        // Trigger alerts after update
        await alertService.checkAndCreateAlerts(userId);

        return updatedTransaction;
    } catch (error) {
        throw error;
    }
};

exports.deleteTransaction = async (userId, transactionId) => {
    try {
        const deleted =
            await transactionRepo.deleteTransaction(userId, transactionId);

        // Trigger alerts after delete
        await alertService.checkAndCreateAlerts(userId);

        return deleted;
    } catch (error) {
        throw error;
    }
};