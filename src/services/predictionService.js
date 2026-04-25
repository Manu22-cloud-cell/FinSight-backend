const Transaction = require("../models/transactionModel");
const AppError = require("../utils/AppError");

exports.getPrediction = async (user) => {
    if (!user || !user._id) {
        throw new AppError("User not found", 404);
    }

    const userId = user._id;
    const today = new Date();

    const startOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
    );

    const daysPassed = today.getDate();

    // ================= MONTHLY EXPENSE =================
    const transactions = await Transaction.find({
        userId,
        type: "expense",
        date: { $gte: startOfMonth },
    });

    const totalExpense = (transactions || []).reduce(
        (sum, t) => sum + t.amount,
        0
    );

    // ================= LAST 7 DAYS =================
    const last7Days = new Date();
    last7Days.setDate(today.getDate() - 7);

    const recentTransactions = await Transaction.find({
        userId,
        type: "expense",
        date: { $gte: last7Days },
    });

    const recentTotal = (recentTransactions || []).reduce(
        (sum, t) => sum + t.amount,
        0
    );

    // ================= BURN RATE =================
    const safeDays = Math.max(daysPassed, 3);
    const fallbackBurnRate = safeDays > 0 ? totalExpense / safeDays : 0;

    const recentDays = Math.min(7, daysPassed);
    const recentDailyAvg =
        recentTotal > 0 ? recentTotal / recentDays : 0;

    const weightRecent = 0.6;
    const weightOverall = 0.4;

    const dailyBurnRate =
        (recentDailyAvg * weightRecent) +
        (fallbackBurnRate * weightOverall);

    // ================= MONTH DAYS =================
    const totalDaysInMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
    ).getDate();

    const remainingDays = Math.max(
        0,
        totalDaysInMonth - daysPassed
    );

    // Predict only future spending
    const predictedExpense =
        totalExpense + (dailyBurnRate * remainingDays);

    const budget = user.monthlyBudget || 0;

    // ================= REMAINING BUDGET =================
    const rawRemaining = budget - totalExpense;

    // never go negative (UI-friendly)
    const remainingBudget = Math.max(0, rawRemaining);

    // ================= DAYS TO EXHAUST =================
    let daysToExhaustBudget = null;

    if (dailyBurnRate > 0) {
        const rawDays = rawRemaining / dailyBurnRate;
        daysToExhaustBudget = Math.max(0, Math.round(rawDays));
    }

    // ================= MESSAGE =================
    let message = "You're on track 👍";

    if (budget > 0) {
        const usagePercent = (predictedExpense / budget) * 100;

        if (usagePercent > 120) {
            message = "🚨 High overspending risk!";
        } else if (usagePercent > 100) {
            message = "⚠️ You may exceed your budget";
        } else if (usagePercent < 70) {
            message = "💰 Great savings habit!";
        }
    }

    // Extra UX polish
    if (rawRemaining < 0) {
        message = "🚨 Budget exhausted! Reduce spending immediately";
    }

    return {
        totalExpense,
        dailyBurnRate: Math.round(dailyBurnRate || 0),
        predictedExpense: Math.round(predictedExpense || 0),
        budget,
        remainingBudget: Math.round(remainingBudget),
        daysToExhaustBudget,
        message,
    };
};