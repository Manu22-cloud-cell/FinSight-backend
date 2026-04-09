const analyticsRepo = require("../repositories/analyticsRepository");
const predictionService = require("./predictionService");
const userRepository = require("../repositories/userRepository");
const financialHealthService = require("./financialHealthService");

exports.getSummary = async (userId) => {
  const data = await analyticsRepo.getSummary(userId);

  let income = 0;
  let expense = 0;

  data.forEach((item) => {
    if (item._id === "income") income = item.total;
    if (item._id === "expense") expense = item.total;
  });

  return {
    totalIncome: income,
    totalExpense: expense,
    balance: income - expense,
  };
};

exports.getCategoryBreakdown = async (userId) => {
  const data = await analyticsRepo.getCategoryBreakdown(userId);

  const result = {};

  data.forEach((item) => {
    result[item._id] = item.total;
  });

  return result;
};

exports.getMonthlyTrends = async (userId) => {
  const data = await analyticsRepo.getMonthlyTrends(userId);

  const result = {};

  data.forEach((item) => {
    const key = `${item._id.year}-${item._id.month}`;

    if (!result[key]) {
      result[key] = {
        income: 0,
        expense: 0,
      };
    }

    if (item._id.type === "income") {
      result[key].income = item.total;
    } else {
      result[key].expense = item.total;
    }
  });

  return result;
};

exports.getDashboard = async (userId) => {
  const [summary, categories, trends, user] = await Promise.all([
    analyticsRepo.getSummary(userId),
    analyticsRepo.getCategoryBreakdown(userId),
    analyticsRepo.getMonthlyTrends(userId),
    userRepository.getUserById(userId),
  ]);

  // Summary
  let income = 0;
  let expense = 0;

  summary.forEach((item) => {
    if (item._id === "income") income = item.total;
    if (item._id === "expense") expense = item.total;
  });

  // Categories
  const categoryData = {};
  categories.forEach((item) => {
    categoryData[item._id] = item.total;
  });

  // Trends
  const trendData = {};
  trends.forEach((item) => {
    const key = `${item._id.year}-${item._id.month}`;

    if (!trendData[key]) {
      trendData[key] = { income: 0, expense: 0 };
    }

    if (item._id.type === "income") {
      trendData[key].income = item.total;
    } else {
      trendData[key].expense = item.total;
    }
  });

  // Prediction Data
  let prediction = null;

  if (user) {
    prediction = await predictionService.getPrediction(user);
  }

  const health = await financialHealthService.getFinancialHealthScore(userId);

  return {
    summary: {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
    },
    categories: categoryData,
    trends: trendData,
    prediction,
    healthScore: health.score,
  };
};