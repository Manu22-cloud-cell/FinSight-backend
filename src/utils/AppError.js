class AppError extends Error {
    constructor(message, statusCode) {
        super(message);

        this.status = statusCode;
        this.success = false;

        // Maintains proper stack trace (cleaner debugging)
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;