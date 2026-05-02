const Transaction = require("../models/transactionModel");
const AppError = require("../utils/AppError");

exports.getPrediction = async (user) => {
    if (!user || !user._id) {
        throw new AppError("User not found", 404);
    }

    const userId = user._id;
    const today = new Date();

    // ================= MONTH START =================
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
        date: { $gte: startOfMonth, $lte: today },
    });

    const totalExpense = (transactions || []).reduce(
        (sum, t) => sum + t.amount,
        0
    );

    // ================= LAST 7 DAYS =================
    const last7Days = new Date(today);
    last7Days.setDate(today.getDate() - 7);

    const recentTransactions = await Transaction.find({
        userId,
        type: "expense",
        date: { $gte: last7Days, $lte: today },
    });

    const recentTotal = (recentTransactions || []).reduce(
        (sum, t) => sum + t.amount,
        0
    );

    // ================= BURN RATE =================

    const fallbackBurnRate =
        daysPassed > 0 ? totalExpense / daysPassed : 0;

    const actualRecentDays = Math.max(
        1,
        Math.ceil(
            (today - last7Days) / (1000 * 60 * 60 * 24)
        )
    );

    const recentDailyAvg =
        recentTotal > 0 ? recentTotal / actualRecentDays : 0;

    let weightRecent = 0.6;
    let weightOverall = 0.4;

    if (daysPassed <= 3) {
        weightRecent = 0.8;
        weightOverall = 0.2;
    } else if (daysPassed <= 7) {
        weightRecent = 0.7;
        weightOverall = 0.3;
    }

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

    // ================= PREDICTION =================
    const predictedExpense =
        totalExpense + (dailyBurnRate * remainingDays);

    const budget = user.monthlyBudget || 0;

    // ================= REMAINING BUDGET =================
    const rawRemaining = budget - totalExpense;

    const remainingBudget = Math.max(0, rawRemaining);

    // ================= DAYS TO EXHAUST =================
    let daysToExhaustBudget = null;

    if (rawRemaining <= 0) {
        daysToExhaustBudget = 0;
    } else if (dailyBurnRate > 0) {
        const rawDays = rawRemaining / dailyBurnRate;
        daysToExhaustBudget = Math.max(0, Math.round(rawDays));
    }

    // ================= MESSAGE =================
    let message = "You're on track 👍";

    const usagePercent =
        budget > 0 ? (totalExpense / budget) * 100 : 0;

    const predictedUsagePercent =
        budget > 0 ? (predictedExpense / budget) * 100 : 0;

    if (predictedUsagePercent > 120) {
        message = "🚨 High overspending risk!";
    } else if (predictedUsagePercent > 100) {
        message = "⚠️ You may exceed your budget";
    } else if (daysPassed > 5 && predictedUsagePercent < 70) {
        message = "💰 Great savings habit!";
    }

    // Override if already exceeded
    if (rawRemaining < 0) {
        message = "🚨 Budget exhausted! Reduce spending immediately";
    }

    return {
        totalExpense: Math.round(totalExpense),
        dailyBurnRate: Math.round(dailyBurnRate),
        predictedExpense: Math.round(predictedExpense),
        budget,
        remainingBudget: Math.round(remainingBudget),
        daysToExhaustBudget,
        usagePercent: Math.round(usagePercent),
        predictedUsagePercent: Math.round(predictedUsagePercent),
        message,
    };
};