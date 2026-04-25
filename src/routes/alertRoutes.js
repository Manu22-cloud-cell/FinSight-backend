const express = require("express");
const router = express.Router();
const alertController = require("../controllers/alertController");
const { protect } = require("../middlewares/authMiddleware");
const isPremiumUser = require("../middlewares/premiumMiddleware");

router.get("/", protect, isPremiumUser, alertController.getAlerts);
router.put("/:id/read", protect, isPremiumUser, alertController.markAsRead);

module.exports = router;