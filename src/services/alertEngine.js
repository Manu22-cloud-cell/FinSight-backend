const userRepository = require("../repositories/userRepository");
const transactionRepository = require("../repositories/transactionRepository");
const predictionService = require("./predictionService");

exports.runChecks = async (userId) => {
  const alerts = [];

  const user = await userRepository.getUserById(userId);

  // Safety check
  if (!user) {
    console.error("User not found for alert engine:", userId);
    return alerts;
  }

  // Get current month range
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const now = new Date();

  // Fetch ONLY current month transactions
  const transactions = await transactionRepository.getUserTransactions(userId, {
    startDate: startOfMonth,
    endDate: now,
  });

  let totalExpense = 0;
  let todayExpense = 0;

  const today = new Date().toDateString();

  transactions.forEach((txn) => {
    if (txn.type === "expense") {
      totalExpense += txn.amount;

      if (new Date(txn.date).toDateString() === today) {
        todayExpense += txn.amount;
      }
    }
  });

  // 1. Budget Exceeded
  if (user.monthlyBudget > 0 && totalExpense > user.monthlyBudget) {
    alerts.push({
      type: "BUDGET_EXCEEDED",
      message: "You have exceeded your monthly budget!",
    });
  }

  // 2. High Spending Today
  if (user.monthlyBudget > 0 && todayExpense > user.monthlyBudget * 0.3) {
    alerts.push({
      type: "HIGH_SPENDING",
      message: "High spending detected today!",
    });
  }

  // 3. Category Alert
  const categoryMap = {};

  transactions.forEach((txn) => {
    if (txn.type === "expense") {
      categoryMap[txn.category] =
        (categoryMap[txn.category] || 0) + txn.amount;
    }
  });

  for (let category in categoryMap) {
    if (user.monthlyBudget > 0 && categoryMap[category] > user.monthlyBudget * 0.4) {
      alerts.push({
        type: "CATEGORY_LIMIT",
        message: `${category} spending is too high`,
      });
    }
  }

  // 4. Prediction Alert (USING predictionService)
  try {
    const prediction = await predictionService.getPrediction(user);

    if (prediction.predictedExpense > prediction.budget * 1.1) {
      alerts.push({
        type: "PREDICTION_ALERT",
        message: `${prediction.message} (Predicted: ₹${prediction.predictedExpense})`,
      });
    }

    if (prediction.daysToExhaustBudget !== null && prediction.daysToExhaustBudget <= 5) {
      alerts.push({
        type: "PREDICTION_ALERT",
        message: `⚠️ You may run out of budget in ${prediction.daysToExhaustBudget} days`,
      });
    }

  } catch (error) {
    console.error("Prediction error:", error);
  }

  return alerts;
};