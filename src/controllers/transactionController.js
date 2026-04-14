const transactionService = require("../services/transactionService");

exports.addTransaction = async (req, res) => {
  try {
    const transaction = await transactionService.addTransaction(
      req.user._id,
      req.body
    );

    res.status(201).json({
      message: "Transaction added",
      transaction,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const result = await transactionService.getTransactions(
      req.user._id,
      req.query
    );

    res.status(200).json(result); 
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    await transactionService.deleteTransaction(
      req.user._id,
      req.params.id
    );

    res.status(200).json({
      message: "Transaction deleted",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};