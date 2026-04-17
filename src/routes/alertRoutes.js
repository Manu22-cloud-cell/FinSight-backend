const express = require("express");
const router = express.Router();
const alertController = require("../controllers/alertController");
const { protect } = require("../middlewares/authMiddleware");
const isPremium = require("../middlewares/premiumMiddleware");

router.get("/", protect, alertController.getAlerts);

module.exports = router;