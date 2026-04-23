const analyticsService = require("../services/analyticsService");
const asyncHandler = require("../utils/asyncHandler");

exports.getSummary = asyncHandler(async (req, res) => {
  const summary = await analyticsService.getSummary(req.user._id);

  res.status(200).json({
    summary,
  });
});

exports.getCategoryBreakdown = asyncHandler(async (req, res) => {
  const data = await analyticsService.getCategoryBreakdown(req.user._id);

  res.status(200).json({
    categoryBreakdown: data,
  });
});

exports.getMonthlyTrends = asyncHandler(async (req, res) => {
  const data = await analyticsService.getMonthlyTrends(req.user._id);

  res.status(200).json({
    monthlyTrends: data,
  });
});

exports.getDashboard = asyncHandler(async (req, res) => {
  const data = await analyticsService.getDashboard(req.user._id);

  res.status(200).json({
    dashboard: data,
  });
});

exports.getCategoryByFilter = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { type, date, month, year } = req.query;

  const data = await analyticsService.getCategoryBreakdownByFilter(
    userId,
    type,
    date,
    month,
    year
  );

  res.status(200).json({ success: true, data });
});