// server/middleware/requestLogger.js
const log = require('../utils/logger');

function requestLoggerMiddleware(req, res, next) {
    const sessionId = req.query?.sessionId || req.body?.sessionId || 'N/A';
    log.request(req, sessionId);
    next();
}

module.exports = requestLoggerMiddleware;