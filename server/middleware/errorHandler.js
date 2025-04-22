// server/middleware/errorHandler.js
const log = require('../utils/logger');
const { NODE_ENV } = require('../config/env');
const { ERROR_CODES } = require('../utils/constants');

function errorHandlerMiddleware(err, req, res, next) {
    // Log the error internally
    log.error(`Error occurred for ${req.method} ${req.path}:`, err);

    // Determine status code - use error's statusCode if available, otherwise 500
    const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;

    // Determine error code - use error's code if available
    const errorCode = err.code || ERROR_CODES.INTERNAL_ERROR;

    // Determine message - use error's message, fallback to generic message
    let message = err.message || 'An unexpected internal server error occurred.';
    // Avoid exposing sensitive internal details in production
    if (NODE_ENV !== 'development' && statusCode >= 500) {
        message = 'An internal server error occurred. Please try again later.';
    }

    res.status(statusCode).json({
        error: errorCode,
        message: message,
        // Optionally include details (like stack trace) in development environment only
        details: NODE_ENV === 'development' ? (err.details || err.stack) : undefined
    });
}

module.exports = errorHandlerMiddleware;