const express = require("express");
const router = express.Router();

const reportController = require("../controllers/reportController");
const { protect } = require("../middlewares/authMiddleware");
const isPremiumUser = require("../middlewares/premiumMiddleware");

router.get("/", protect, isPremiumUser, reportController.getReports);
router.get("/download", protect, isPremiumUser, reportController.downloadReport);
router.get("/history", protect, isPremiumUser, reportController.getDownloadedReports);

module.exports = router;