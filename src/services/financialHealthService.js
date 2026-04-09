const predictionService = require("./predictionService");
const analyticsService = require("./analyticsService");
const userRepository = require("../repositories/userRepository");

exports.getFinancialHealthScore = async (userId) => {
    // Get required data
    const user = await userRepository.getUserById(userId);
    const summary = await analyticsService.getSummary(userId);
    const prediction = await predictionService.getPrediction(user);

    const budget = user.monthlyBudget || 0;
    const expense = summary.totalExpense;
    const income = summary.totalIncome;

    let score = 100;
    let insights = [];

    // 1. Budget Usage (40 points)
    if (budget > 0) {
        const usage = expense / budget;

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

    // 2. Savings Ratio (30 points)
    if (income > 0) {
        const savingsRatio = (income - expense) / income;

        if (savingsRatio < 0) {
            score -= 30;
            insights.push("🚨 You are spending more than you earn");
        } else if (savingsRatio < 0.2) {
            score -= 15;
            insights.push("⚠️ Low savings detected");
        } else {
            insights.push("💰 Good savings habit");
        }
    }

    // 3. Prediction Risk (30 points)
    if (prediction.predictedExpense > budget * 1.2) {
        score -= 30;
        insights.push("🚨 High future overspending risk");
    } else if (prediction.predictedExpense > budget) {
        score -= 20;
        insights.push("⚠️ Future budget risk detected");
    } else {
        insights.push("📉 Future spending looks stable");
    }

    // Clamp score between 0–100
    score = Math.max(0, Math.min(100, score));

    return {
        score,
        insights,
        summary,
        prediction,
    };
};