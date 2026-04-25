const predictionService = require("./predictionService");
const analyticsService = require("./analyticsService");
const userRepository = require("../repositories/userRepository");
const AppError = require("../utils/AppError");

exports.getFinancialHealthScore = async (userId, monthlySummaryParam) => {
    if (!userId) {
        throw new AppError("User ID is required", 400);
    }

    const user = await userRepository.getUserById(userId);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    const prediction = await predictionService.getPrediction(user);
    const budget = user.monthlyBudget || 0;

    let score = 100;
    let insights = [];

    let monthlyIncome = 0;
    let monthlyExpense = 0;

    if (monthlySummaryParam) {
        monthlyIncome = monthlySummaryParam.totalIncome || 0;
        monthlyExpense = monthlySummaryParam.totalExpense || 0;
    } else {
        const ms = await analyticsService.getMonthlySummary(userId);
        monthlyIncome = ms.totalIncome || 0;
        monthlyExpense = ms.totalExpense || 0;
    }

    // ================= Budget Usage (40 points) =================
    if (budget > 0) {
        const usage = monthlyExpense / budget;

        if (usage > 1.2) {
            score -= 40;
            insights.push("🚨 You are heavily overspending");
        } else if (usage > 1) {
            score -= 30;
            insights.push("⚠️ You exceeded your budget");
        } else if (usage > 0.8) {
            score -= 15;
            insights.push("⚠️ You are close to your budget limit");
        } else {
            insights.push("✅ Budget usage is under control");
        }
    }

    // ================= Savings Ratio (30 points) =================
    if (monthlyIncome > 0) {
        const savingsRatio = (monthlyIncome - monthlyExpense) / monthlyIncome;

        if (savingsRatio < 0) {
            score -= 30;
            insights.push("🚨 You are spending more than you earn (this month)");
        } else if (savingsRatio < 0.2) {
            score -= 15;
            insights.push("⚠️ Low savings detected this month");
        } else if (savingsRatio < 0.4) {
            insights.push("🙂 Moderate savings this month");
        } else {
            insights.push("💰 Good savings habit this month");
        }
    } else {
        insights.push("ℹ️ No income data available this month");
    }

    // ================= Prediction Risk (30 points) =================
    if (budget > 0) {
        if (prediction.predictedExpense > budget * 1.2) {
            score -= 30;
            insights.push("🚨 High future overspending risk");
        } else if (prediction.predictedExpense > budget) {
            score -= 20;
            insights.push("⚠️ Future budget risk detected");
        } else {
            insights.push("📉 Future spending looks stable");
        }
    }

    // Clamp score
    score = Math.max(0, Math.min(100, score));

    return {
        score,
        insights,
        prediction,
    };
};