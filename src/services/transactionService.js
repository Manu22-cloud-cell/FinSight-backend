const transactionRepo = require("../repositories/transactionRepository");
const alertService = require("./alertService");
const AppError = require("../utils/AppError");

// ADD TRANSACTION
exports.addTransaction = async (userId, data) => {
    const { amount, type, category } = data;

    if (!amount || !type || !category) {
        throw new AppError("Amount, type and category are required", 400);
    }

    const transaction = await transactionRepo.createTransaction({
        ...data,
        userId,
    });

    if (!transaction) {
        throw new AppError("Failed to create transaction", 500);
    }

    // Trigger alerts AFTER transaction
    alertService.checkAndCreateAlerts(userId).catch((err) => {
        console.error("Alert failed:", err.message);
    });

    console.log("Triggering alerts for user:", userId);

    return transaction;
};


// GET TRANSACTIONS
exports.getTransactions = async (userId, filters) => {
    return await transactionRepo.getUserTransactions(userId, filters);
};


// UPDATE TRANSACTION
exports.updateTransaction = async (userId, transactionId, data) => {
    if (!transactionId) {
        throw new AppError("Transaction ID is required", 400);
    }

    const updatedTransaction =
        await transactionRepo.updateTransaction(
            userId,
            transactionId,
            data
        );

    if (!updatedTransaction) {
        throw new AppError("Transaction not found or update failed", 404);
    }

    // Trigger alerts after update
    alertService.checkAndCreateAlerts(userId).catch((err) => {
        console.error("Alert failed:", err.message);
    });

    return updatedTransaction;
};


// DELETE TRANSACTION
exports.deleteTransaction = async (userId, transactionId) => {
    if (!transactionId) {
        throw new AppError("Transaction ID is required", 400);
    }

    const deleted =
        await transactionRepo.deleteTransaction(userId, transactionId);

    if (!deleted) {
        throw new AppError("Transaction not found or delete failed", 404);
    }

    // Trigger alerts after delete
    alertService.checkAndCreateAlerts(userId).catch((err) => {
        console.error("Alert failed:", err.message);
    });

    return deleted;
};