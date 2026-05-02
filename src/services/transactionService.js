const transactionRepo = require("../repositories/transactionRepository");
const alertService = require("./alertService");
const AppError = require("../utils/AppError");
const { deleteCache } = require("../utils/cache");

// Shared helper
const getYearMonthKey = (date = new Date()) => {
    return `${date.getFullYear()}-${date.getMonth() + 1}`;
};

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

    const txDate = new Date(data.date || Date.now());
    const txMonth = getYearMonthKey(txDate);

    // Current month
    const currentMonth = getYearMonthKey(new Date());

    // Delete both
    await deleteCache(`cache:dashboard:${userId}:${txMonth}`);
    await deleteCache(`cache:monthly-summary:${userId}:${txMonth}`);

    await deleteCache(`cache:dashboard:${userId}:${currentMonth}`);
    await deleteCache(`cache:monthly-summary:${userId}:${currentMonth}`);

    alertService.checkAndCreateAlerts(userId).catch((err) => {
        console.error("Alert failed:", err.message);
    });

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

    const txDate = new Date(data.date || Date.now());
    const txMonth = getYearMonthKey(txDate);

    // Current month
    const currentMonth = getYearMonthKey(new Date());

    // Delete both
    await deleteCache(`cache:dashboard:${userId}:${txMonth}`);
    await deleteCache(`cache:monthly-summary:${userId}:${txMonth}`);

    await deleteCache(`cache:dashboard:${userId}:${currentMonth}`);
    await deleteCache(`cache:monthly-summary:${userId}:${currentMonth}`);

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

    // Get transaction BEFORE delete
    const existingTransaction =
        await transactionRepo.getTransactionById(userId, transactionId);

    if (!existingTransaction) {
        throw new AppError("Transaction not found", 404);
    }

    const deleted =
        await transactionRepo.deleteTransaction(userId, transactionId);

    if (!deleted) {
        throw new AppError("Transaction delete failed", 500);
    }

    const txDate = new Date(data.date || Date.now());
    const txMonth = getYearMonthKey(txDate);

    // Current month
    const currentMonth = getYearMonthKey(new Date());

    // Delete both
    await deleteCache(`cache:dashboard:${userId}:${txMonth}`);
    await deleteCache(`cache:monthly-summary:${userId}:${txMonth}`);

    await deleteCache(`cache:dashboard:${userId}:${currentMonth}`);
    await deleteCache(`cache:monthly-summary:${userId}:${currentMonth}`);

    alertService.checkAndCreateAlerts(userId).catch((err) => {
        console.error("Alert failed:", err.message);
    });

    return deleted;
};