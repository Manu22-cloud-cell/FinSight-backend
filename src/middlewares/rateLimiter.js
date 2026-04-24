const rateLimit = require("express-rate-limit");
const logger = require("../utils/logger");

// Strict limiter (for login, reset password, payments)
exports.strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    handler: (req, res) => {
        logger.warn(`Rate limit exceeded: ${req.ip}`);

        res.status(429).json({
            error: "Too many attempts. Please try again later.",
        });
    },
});
// Normal limiter (for general APIs if needed later)
exports.apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: "Too many requests. Please slow down.",
    },
});