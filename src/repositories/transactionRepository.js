const Transaction = require("../models/transactionModel");

exports.createTransaction = async (data) => {
  return await Transaction.create(data);
};

exports.getUserTransactions = async (userId, filters) => {

  console.log("Filters received:", filters);

  // HARD DEFENSIVE FIX
  if (!filters || typeof filters !== "object") {
    filters = {};
  }

  const query = { userId };

  // Safe checks
  if (filters.type) {
    query.type = filters.type;
  }

  if (filters.category) {
    query.category = filters.category;
  }

  // Date filtering (safe)
  if (filters.startDate || filters.endDate) {
    query.date = {};

    if (filters.startDate) {
      query.date.$gte = new Date(filters.startDate);
    }

    if (filters.endDate) {
      query.date.$lte = new Date(filters.endDate);
    }
  }

  return await Transaction.find(query).sort({ date: -1 });
};