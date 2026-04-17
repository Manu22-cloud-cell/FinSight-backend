const Transaction = require("../models/transactionModel");
const DownloadedReport = require("../models/downloadedReportModel");
const mongoose = require("mongoose");

// Daily / Monthly
exports.getTransactionsByDateRange = async (userId, start, end) => {
  return Transaction.find({
    userId,
    date: { $gte: start, $lte: end },
  }).sort({ date: 1 });
};

// Yearly Aggregation
exports.getYearlyTransactions = async (userId, year) => {
  return Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { month: { $month: "$date" } },
        income: {
          $sum: {
            $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
          },
        },
        expense: {
          $sum: {
            $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
          },
        },
      },
    },
    {
      $project: {
        month: "$_id.month",
        income: 1,
        expense: 1,
        _id: 0,
      },
    },
    { $sort: { month: 1 } },
  ]);
};

// Save Report
exports.saveDownloadedReport = async (data) => {
  return DownloadedReport.create(data);
};

// History
exports.getDownloadedReports = async (userId) => {
  return DownloadedReport.find({ userId }).sort({ downloadedAt: -1 });
};