const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const isPremiumUser = require("../middlewares/premiumMiddleware");
const predictionController = require("../controllers/predictionController");

router.get("/", protect, isPremiumUser, predictionController.getPrediction);

module.exports = router;