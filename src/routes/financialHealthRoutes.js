const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const isPremium = require("../middlewares/premiumMiddleware");
const financialHealthController = require("../controllers/financialHealthController");

router.get("/", protect, financialHealthController.getHealthScore);

module.exports = router;