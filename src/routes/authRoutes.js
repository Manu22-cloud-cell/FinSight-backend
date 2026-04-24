const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const { strictLimiter } = require("../middlewares/rateLimiter");

router.post("/register", strictLimiter, authController.register);
router.post("/login", strictLimiter, authController.login);
router.post("/forgot-password", strictLimiter, authController.forgotPassword);
router.post("/reset-password", strictLimiter, authController.resetPassword);

module.exports = router;