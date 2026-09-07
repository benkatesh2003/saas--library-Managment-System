/**
 * @file jwtHelper.js
 * @description JWT utilities for generating and verifying tokens.
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

/**
 * Generates a JSON Web Token.
 * @param {Object} payload - Data to encode in the token.
 * @param {string|number} [expiresIn] - Expiration time (e.g., '1h', '7d'). Defaults to JWT_EXPIRES_IN.
 * @returns {string} Signed JWT.
 */
const generateToken = (payload, expiresIn = JWT_EXPIRES_IN) => {
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
  } catch (error) {
    throw new Error(`Token generation failed: ${error.message}`);
  }
};

/**
 * Verifies a JSON Web Token.
 * @param {string} token - The JWT to verify.
 * @returns {Object} Decoded payload.
 * @throws {Error} If token is invalid or expired.
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
