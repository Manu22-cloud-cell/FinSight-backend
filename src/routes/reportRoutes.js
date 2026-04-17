const express = require("express");
const router = express.Router();

const reportController = require("../controllers/reportController");
const { protect } = require("../middlewares/authMiddleware");
const isPremiumUser = require("../middlewares/premiumMiddleware");

router.get("/", protect, reportController.getReports);
router.get("/download", protect, reportController.downloadReport);
router.get("/history", protect, reportController.getDownloadedReports);

module.exports = router;