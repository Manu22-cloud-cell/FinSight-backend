const analyticsRepo = require("../repositories/analyticsRepository");
const predictionService = require("./predictionService");
const userRepository = require("../repositories/userRepository");
const financialHealthService = require("./financialHealthService");
const AppError = require("../utils/AppError");
const { getCache, setCache } = require("../utils/cache");

// Shared helper
const getYearMonthKey = (date = new Date()) => {
  return `${date.getFullYear()}-${date.getMonth() + 1}`;
};

// ================= SUMMARY =================
exports.getSummary = async (userId) => {
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  const data = await analyticsRepo.getSummary(userId);

  let income = 0;
  let expense = 0;

  (data || []).forEach((item) => {
    if (item._id === "income") income = item.total;
    if (item._id === "expense") expense = item.total;
  });

  return {
    totalIncome: income,
    totalExpense: expense,
    balance: income - expense,
  };
};

// ================= MONTHLY SUMMARY (CACHED) =================
exports.getMonthlySummary = async (userId) => {
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  const yearMonthKey = getYearMonthKey();
  const cacheKey = `cache:monthly-summary:${userId}:${yearMonthKey}`;

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const data = await analyticsRepo.getSummaryByDateRange(
    userId,
    start,
    end
  );

  let income = 0;
  let expense = 0;

  (data || []).forEach((item) => {
    if (item._id === "income") income = item.total;
    if (item._id === "expense") expense = item.total;
  });

  const result = {
    totalIncome: income,
    totalExpense: expense,
  };

  setCache(cacheKey, result, 300).catch((err) =>
    console.error("Monthly summary cache failed:", err.message)
  );

  return result;
};

// ================= CATEGORY =================
exports.getCategoryBreakdown = async (userId) => {
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  const data = await analyticsRepo.getCategoryBreakdown(userId);

  const result = {};
  (data || []).forEach((item) => {
    result[item._id] = item.total;
  });

  return result;
};

// ================= TRENDS =================
exports.getMonthlyTrends = async (userId) => {
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  const data = await analyticsRepo.getMonthlyTrends(userId);

  const result = {};

  (data || []).forEach((item) => {
    const key = `${item._id.year}-${item._id.month}`;

    if (!result[key]) {
      result[key] = { income: 0, expense: 0 };
    }

    if (item._id.type === "income") {
      result[key].income = item.total;
    } else {
      result[key].expense = item.total;
    }
  });

  return result;
};

// ================= DASHBOARD =================
exports.getDashboard = async (userId) => {
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  const yearMonthKey = getYearMonthKey();
  const cacheKey = `cache:dashboard:${userId}:${yearMonthKey}`;

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const [categories, trends, user, monthlySummary] = await Promise.all([
    analyticsRepo.getCategoryBreakdown(userId),
    analyticsRepo.getMonthlyTrends(userId),
    userRepository.getUserById(userId),
    exports.getMonthlySummary(userId),
  ]);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const summary = {
    totalIncome: monthlySummary.totalIncome,
    totalExpense: monthlySummary.totalExpense,
    balance:
      monthlySummary.totalIncome - monthlySummary.totalExpense,
  };

  const categoryData = {};
  (categories || []).forEach((item) => {
    categoryData[item._id] = item.total;
  });

  const trendData = {};
  (trends || []).forEach((item) => {
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

  const prediction = await predictionService.getPrediction(user);
  const health = await financialHealthService.getFinancialHealthScore(
    userId,
    monthlySummary
  );

  const result = {
    summary,
    categories: categoryData,
    trends: trendData,
    prediction,
    healthScore: health.score,
    healthInsights: health.insights,
  };

  setCache(cacheKey, result, 300).catch((err) =>
    console.error("Cache set failed:", err.message)
  );

  return result;
};

// ================= FILTERED CATEGORY =================
exports.getCategoryBreakdownByFilter = async (
  userId,
  type,
  date,
  month,
  year
) => {
  if (!userId || !type) {
    throw new AppError("User ID and type are required", 400);
  }

  let start, end;

  if (type === "daily") {

    //if (!date) throw new AppError("Date is required", 400);

    start = new Date(`${date}T00:00:00`);
    end = new Date(`${date}T23:59:59`);
  }

  else if (type === "monthly") {
    //if (!month || !year) {
    //throw new AppError("Month and year are required", 400);
    //}

    start = new Date(year, month - 1, 1);
    end = new Date(year, month, 0, 23, 59, 59);
  }

  else if (type === "yearly") {
    //if (!year) throw new AppError("Year is required", 400);

    start = new Date(`${year}-01-01`);
    end = new Date(`${year}-12-31`);
  }

  else {
    throw new AppError("Invalid filter type", 400);
  }

  const data = await analyticsRepo.getCategoryBreakdownByDateRange(
    userId,
    start,
    end
  );

  const result = {};

  (data || []).forEach((item) => {
    result[item._id] = item.total;
  });

  return result;
};