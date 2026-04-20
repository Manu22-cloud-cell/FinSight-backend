const Transaction = require("../models/transactionModel");

exports.getPrediction = async (user) => {
    const userId = user._id;

    const today = new Date();

    // Start of month
    const startOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
    );

    const daysPassed = today.getDate();

    // Monthly transactions
    const transactions = await Transaction.find({
        userId,
        type: "expense",
        date: { $gte: startOfMonth },
    });

    const totalExpense = transactions.reduce(
        (sum, t) => sum + t.amount,
        0
    );

    // Last 7 days trend
    const last7Days = new Date();
    last7Days.setDate(today.getDate() - 7);

    const recentTransactions = await Transaction.find({
        userId,
        type: "expense",
        date: { $gte: last7Days },
    });

    const recentTotal = recentTransactions.reduce(
        (sum, t) => sum + t.amount,
        0
    );

    // Safe burn rate
    const safeDays = Math.max(daysPassed, 3);
    const fallbackBurnRate = totalExpense / safeDays;

    const recentDailyAvg = recentTotal / 7;

    const dailyBurnRate =
        recentTotal > 0 ? recentDailyAvg : fallbackBurnRate;

    // Month length
    const totalDaysInMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
    ).getDate();

    const predictedExpense = dailyBurnRate * totalDaysInMonth;

    const budget = user.monthlyBudget || 0;

    // Remaining Budget
    const remainingBudget = budget - totalExpense;

    // Days to exhaust budget
    let daysToExhaustBudget = null;

    if (dailyBurnRate > 0) {
        daysToExhaustBudget = Math.round(remainingBudget / dailyBurnRate);
    }

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

    return {
        totalExpense,
        dailyBurnRate: Math.round(dailyBurnRate),
        predictedExpense: Math.round(predictedExpense),
        budget,
        remainingBudget: Math.round(remainingBudget), // ✅ NEW
        daysToExhaustBudget, // ✅ NEW
        message,
    };
};