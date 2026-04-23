const Transaction = require("../models/transactionModel");

exports.createTransaction = async (data) => {
  return await Transaction.create(data);
};

exports.getUserTransactions = async (userId, filters) => {

  if (!filters || typeof filters !== "object") {
    filters = {};
  }

  const query = { userId };

  // Filters
  if (filters.type) query.type = filters.type;
  if (filters.category) query.category = filters.category;

  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) query.date.$gte = new Date(filters.startDate);
    if (filters.endDate) query.date.$lte = new Date(filters.endDate);
  }

  // Pagination params
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 5;
  const skip = (page - 1) * limit;

  // Total count
  const total = await Transaction.countDocuments(query);

  // Fetch paginated data
  const transactions = await Transaction.find(query)
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);

  return {
    transactions,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
  };
};

// UPDATE
exports.updateTransaction = async (userId, transactionId, data) => {
  const transaction = await Transaction.findOneAndUpdate(
    { _id: transactionId, userId },
    data,
    { new: true }
  );

  if (!transaction) {
    throw new Error("Transaction not found or unauthorized");
  }

  return transaction;
};

// DELETE
exports.deleteTransaction = async (userId, transactionId) => {
  const transaction = await Transaction.findOneAndDelete({
    _id: transactionId,
    userId,
  });

  if (!transaction) {
    throw new Error("Transaction not found or unauthorized");
  }

  return transaction;
};