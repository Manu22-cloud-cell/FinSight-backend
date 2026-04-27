const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { protect } = require("../middlewares/authMiddleware");
const { strictLimiter } = require("../middlewares/rateLimiter");


router.post("/create-order", protect, strictLimiter, paymentController.createOrder);
router.post("/verify", protect, strictLimiter, paymentController.verifyPayment);
// router.post("/webhook", paymentController.handleWebhook);

module.exports = router;