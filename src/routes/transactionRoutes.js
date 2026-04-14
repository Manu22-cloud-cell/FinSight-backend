const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const transactionController = require("../controllers/transactionController");

router.post("/", protect, transactionController.addTransaction);
router.get("/", protect, transactionController.getTransactions);
router.put("/:id", protect, transactionController.updateTransaction);
router.delete("/:id", protect, transactionController.deleteTransaction);

module.exports = router;