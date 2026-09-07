const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const { setSSOSession, getSSOSession } = require('../config/redis');
const { sendError, sendSuccess } = require('../utils/response');

/**
 * Create an SSO session by generating a UUID and storing the JWT in Redis
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createSSOSession = async (req, res, next) => {
  try {
    // Expected that a token is already generated and set on req.token
    // Or we generate one based on req.user
    const token = req.token || (req.user && jwt.sign(
      { id: req.user.id, role: req.user.role, email: req.user.email }, 
      process.env.JWT_SECRET || 'fallback-secret', 
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    ));
    
    if (!token) {
      return sendError(res, 400, 'Cannot create SSO session: No token available');
    }

    const ssoSessionId = uuidv4();
    // 300 seconds = 5 minutes
    await setSSOSession(ssoSessionId, token, 300);
    
    req.ssoSessionId = ssoSessionId;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Exchange the SSO token (session ID) for a JWT
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const exchangeSSOToken = async (req, res) => {
  try {
    const { ssoSessionId } = req.body;
    
    if (!ssoSessionId) {
      return sendError(res, 400, 'SSO session ID is required');
    }

    const token = await getSSOSession(ssoSessionId);
    
    if (!token) {
      return sendError(res, 401, 'Invalid or expired SSO session');
    }
    
    // In a real implementation we might delete the token from redis here for one-time use

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    return sendSuccess(res, 200, 'SSO session exchanged successfully', {
      token,
      user: decoded
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Invalid or expired token in SSO session');
    }
    return sendError(res, 500, 'Failed to exchange SSO token', error.message);
  }
};

module.exports = {
  createSSOSession,
  exchangeSSOToken
};
