const transactionRepo = require("../repositories/transactionRepository");

exports.addTransaction = async (userId, data) => {
  return await transactionRepo.createTransaction({
    ...data,
    userId,
  });
};

exports.getTransactions = async (userId, filters) => {
  return await transactionRepo.getUserTransactions(userId, filters);
};