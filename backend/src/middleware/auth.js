const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/response');

/**
 * Authenticate user using JWT from Authorization header
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Authentication failed: Missing or invalid token');
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    // Attach user to request object
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Authentication failed: Token expired');
    }
    return sendError(res, 401, 'Authentication failed: Invalid token');
  }
};

/**
 * Authorize users based on their roles
 * @param {...String} roles - Allowed roles
 * @returns {Function} Express middleware function
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, 403, 'Authorization failed: Access denied');
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorize,
  isSuperAdmin: authorize('super-admin'),
  isAdmin: authorize('admin'),
  isStudent: authorize('student'),
  isAdminOrSuperAdmin: authorize('admin', 'super-admin')
};
