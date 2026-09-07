const { validationResult, body, param, query } = require('express-validator');
const mongoose = require('mongoose');
const { sendError } = require('../utils/response');

/**
 * Middleware to handle validation errors from express-validator
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed', errors.array());
  }
  next();
};

/**
 * Validation chain for Admin registration
 */
const validateRegister = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('libraryName').notEmpty().withMessage('Library name is required')
];

/**
 * Validation chain for Super Admin registration
 */
const validateSuperAdminRegister = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

/**
 * Common validation chain for login
 */
const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

/**
 * Validator for MongoDB ObjectId
 * @param {String} paramName - Name of the parameter to validate
 */
const validateObjectId = (paramName) => [
  param(paramName).custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error(`Invalid ${paramName}`);
    }
    return true;
  })
];

/**
 * Common validation chain for pagination queries
 */
const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateSuperAdminRegister,
  validateLogin,
  validateObjectId,
  validatePagination
};
