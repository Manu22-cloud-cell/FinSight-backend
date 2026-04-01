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
    const transactions = await transactionService.getTransactions(
      req.user._id,
      req.query
    );

    res.status(200).json({
      transactions,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};