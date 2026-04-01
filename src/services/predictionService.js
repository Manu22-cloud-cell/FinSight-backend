const Transaction = require("../models/transactionModel");

exports.getPrediction = async (user) => {
    const userId = user._id;

    const startOfMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
    );

    const today = new Date();
    const daysPassed = today.getDate();

    // Get this month's expenses
    const transactions = await Transaction.find({
        userId,
        type: "expense",
        date: { $gte: startOfMonth },
    });

    const totalExpense = transactions.reduce(
        (sum, t) => sum + t.amount,
        0
    );

    const dailyBurnRate = totalExpense / daysPassed;

    const totalDaysInMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
    ).getDate();

    const predictedExpense = dailyBurnRate * totalDaysInMonth;

    const budget = user.monthlyBudget || 0;

    let message = "You're on track 👍";

    if (predictedExpense > budget * 1.2) {
        message = "🚨 High overspending risk!";
    } else if (predictedExpense > budget) {
        message = "⚠️ You may exceed your budget";
    } else if (predictedExpense < budget * 0.7) {
        message = "💰 Great savings habit!";
    }

    return {
        totalExpense,
        dailyBurnRate: Math.round(dailyBurnRate),
        predictedExpense: Math.round(predictedExpense),
        budget,
        message,
    };
};