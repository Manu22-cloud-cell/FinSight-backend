const transactionService = require("../services/transactionService");
const asyncHandler = require("../utils/asyncHandler");

exports.addTransaction = asyncHandler(async (req, res) => {
  const transaction = await transactionService.addTransaction(
    req.user._id,
    req.body
  );

  res.status(201).json({
    message: "Transaction added",
    transaction,
  });
});

exports.getTransactions = asyncHandler(async (req, res) => {
  const result = await transactionService.getTransactions(
    req.user._id,
    req.query
  );

  res.status(200).json(result);
});

exports.updateTransaction = asyncHandler(async (req, res) => {
  const updatedTransaction =
    await transactionService.updateTransaction(
      req.user._id,
      req.params.id,
      req.body
    );

  res.status(200).json({
    message: "Transaction updated",
    transaction: updatedTransaction,
  });
});

exports.deleteTransaction = asyncHandler(async (req, res) => {
  await transactionService.deleteTransaction(
    req.user._id,
    req.params.id
  );

  res.status(200).json({
    message: "Transaction deleted",
  });
});