const userRepository = require("../repositories/userRepository");
const transactionRepository = require("../repositories/transactionRepository");
const predictionService = require("./predictionService");
const AppError = require("../utils/AppError");

exports.runChecks = async (userId) => {
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  const alerts = [];

  const user = await userRepository.getUserById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const budget = user.monthlyBudget || 0;

  // ================= DATE RANGE =================
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const now = new Date();

  // ================= TRANSACTIONS =================
  const transactionsResult =
    await transactionRepository.getUserTransactions(userId, {
      startDate: startOfMonth,
      endDate: now,
    });

  const transactions = Array.isArray(transactionsResult)
    ? transactionsResult
    : transactionsResult?.transactions || [];

  let totalExpense = 0;
  let todayExpense = 0;

  const today = new Date().toDateString();

  // ================= CALCULATIONS =================
  transactions.forEach((txn) => {
    if (txn.type === "expense") {
      totalExpense += txn.amount;

      if (new Date(txn.date).toDateString() === today) {
        todayExpense += txn.amount;
      }
    }
  });

  // ================= ALERT 1: BUDGET EXCEEDED =================
  if (budget > 0 && totalExpense > budget) {
    alerts.push({
      type: "BUDGET_EXCEEDED",
      message: "🚨 You have exceeded your monthly budget!",
    });
  }

  // ================= ALERT 2: HIGH SPENDING TODAY =================
  if (budget > 0 && todayExpense > budget * 0.3) {
    alerts.push({
      type: "HIGH_SPENDING",
      message: "⚠️ High spending detected today!",
    });
  }

  // ================= ALERT 3: CATEGORY LIMIT =================
  const categoryMap = {};

  transactions.forEach((txn) => {
    if (txn.type === "expense") {
      categoryMap[txn.category] =
        (categoryMap[txn.category] || 0) + txn.amount;
    }
  });

  Object.keys(categoryMap).forEach((category) => {
    if (budget > 0 && categoryMap[category] > budget * 0.4) {
      alerts.push({
        type: "CATEGORY_LIMIT",
        message: `⚠️ ${category} spending is too high`,
      });
    }
  });

  // ================= ALERT 4: PREDICTION =================
  try {
    const prediction = await predictionService.getPrediction(user);

    // Overspending risk
    if (budget > 0 && prediction.predictedExpense > budget * 1.1) {
      alerts.push({
        type: "PREDICTION_ALERT",
        message: `🚨 ${prediction.message} (Predicted: ₹${prediction.predictedExpense})`,
      });
    }

    // Days to exhaust (only if budget still remaining)
    if (
      prediction.remainingBudget > 0 && // 🔥 KEY FIX
      prediction.daysToExhaustBudget !== null &&
      prediction.daysToExhaustBudget > 0 &&
      prediction.daysToExhaustBudget <= 5
    ) {
      alerts.push({
        type: "PREDICTION_ALERT",
        message: `⚠️ You may run out of budget in ${prediction.daysToExhaustBudget} days`,
      });
    }

    // Already exhausted (explicit alert)
    if (prediction.remainingBudget === 0 && totalExpense > budget) {
      alerts.push({
        type: "PREDICTION_ALERT",
        message: "🚨 Your budget is already exhausted!",
      });
    }

  } catch (error) {
    console.error("Prediction error:", error.message);
  }

  return alerts;
};