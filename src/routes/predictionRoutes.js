const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const isPremium = require("../middlewares/premiumMiddleware");
const predictionController = require("../controllers/predictionController");

router.get("/", protect, predictionController.getPrediction);

module.exports = router;