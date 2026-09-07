const { sendError } = require('../utils/response');

/**
 * Middleware to handle 404 Not Found errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const notFound = (req, res, next) => {
  sendError(res, 404, `Route not found: ${req.method} ${req.originalUrl}`);
};

module.exports = notFound;
