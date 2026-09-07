/**
 * @file response.js
 * @description Standardized response helpers for Express API responses.
 */

/**
 * Sends a standard success response.
 * @param {Object} res - Express response object.
 * @param {number} statusCode - HTTP status code.
 * @param {string} message - Success message.
 * @param {any} [data=null] - Payload data.
 * @returns {Object} JSON response sent to client.
 */
const sendSuccess = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Sends a standard error response.
 * @param {Object} res - Express response object.
 * @param {number} statusCode - HTTP status code.
 * @param {string} message - Error message.
 * @param {any} [error=null] - Error details (stack trace, validation errors, etc.)
 * @returns {Object} JSON response sent to client.
 */
const sendError = (res, statusCode, message, error = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error,
  });
};

module.exports = {
  sendSuccess,
  sendError,
};
