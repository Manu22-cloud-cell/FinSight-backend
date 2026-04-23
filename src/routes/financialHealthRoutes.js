const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const isPremiumUser = require("../middlewares/premiumMiddleware");
const financialHealthController = require("../controllers/financialHealthController");

router.get("/", protect, isPremiumUser, financialHealthController.getHealthScore);

module.exports = router;