const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
    logger.error({
        message: err.message,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl,
    });

    if (res.headersSent) {
        return next(err);
    }

    res.status(err.status || 400).json({
        error: err.message || "Something went wrong",
    });
};

module.exports = errorHandler;