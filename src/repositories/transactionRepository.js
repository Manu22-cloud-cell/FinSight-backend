const Transaction = require("../models/transactionModel");

exports.createTransaction = async (data) => {
  return await Transaction.create(data);
};

exports.getUserTransactions = async (userId, filters) => {
  const query = { userId };

  if (filters.type) query.type = filters.type;
  if (filters.category) query.category = filters.category;

  return await Transaction.find(query).sort({ date: -1 });
};