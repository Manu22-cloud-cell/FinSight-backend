const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const isPremiumUser = require("../middlewares/premiumMiddleware");
const analyticsController = require("../controllers/analyticsController");

router.get("/summary", protect, isPremiumUser, analyticsController.getSummary);
router.get("/categories", protect, isPremiumUser, analyticsController.getCategoryBreakdown);
router.get("/category-filter", protect, isPremiumUser, analyticsController.getCategoryByFilter);
router.get("/trends", protect, isPremiumUser, analyticsController.getMonthlyTrends);
router.get("/dashboard", protect, isPremiumUser, analyticsController.getDashboard);


module.exports = router;