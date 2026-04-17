const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const isPremium = require("../middlewares/premiumMiddleware");
const analyticsController = require("../controllers/analyticsController");

router.get("/summary", protect, analyticsController.getSummary);
router.get("/categories", protect, analyticsController.getCategoryBreakdown);
router.get(
    "/category-filter",
    protect,
    analyticsController.getCategoryByFilter
);
router.get("/trends", protect, analyticsController.getMonthlyTrends);
router.get("/dashboard", protect, analyticsController.getDashboard);


module.exports = router;