const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const analyticsController = require("../controllers/analyticsController");

router.get("/summary", protect, analyticsController.getSummary);
router.get("/categories", protect, analyticsController.getCategoryBreakdown);
router.get("/trends", protect, analyticsController.getMonthlyTrends);
router.get("/dashboard", protect, analyticsController.getDashboard);

module.exports = router;