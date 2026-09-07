const bcrypt = require('bcryptjs');
const { Student, StudentPayment, StudentInvoice } = require('../../models');
const { sendSuccess, sendError } = require('../../utils/response');
const { generateToken } = require('../../utils/jwtHelper');

/**
 * @module StudentAuthController
 * @description Controller for student authentication and profile operations
 */

/**
 * @function login
 * @description Authenticates a student and returns a JWT
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const login = async (req, res) => {
  try {
    const { studentId, password } = req.body;

    const student = await Student.findOne({ studentId }).select('+password');
    if (!student) {
      return sendError(res, 401, 'Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid credentials');
    }

    if (!student.isActive) {
      return sendError(res, 403, 'Account is inactive. Please contact administrator.');
    }

    const payload = {
      id: student._id,
      email: student.email,
      role: 'student',
      adminId: student.adminId
    };

    const token = generateToken(payload);

    return sendSuccess(res, 200, 'Login successful', { 
      token, 
      student: { id: student._id, name: student.name, studentId: student.studentId, email: student.email } 
    });
  } catch (error) {
    console.error('Student login error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

/**
 * @function getProfile
 * @description Retrieves the authenticated student's profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id)
      .populate('assignedSeat')
      .populate('assignedShift')
      .populate('assignedLocker');

    if (!student) {
      return sendError(res, 404, 'Student not found');
    }

    return sendSuccess(res, 200, 'Profile retrieved successfully', student);
  } catch (error) {
    console.error('Student profile error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

/**
 * @function getPaymentHistory
 * @description Retrieves all payment history for the authenticated student
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getPaymentHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { student: req.user.id, adminId: req.user.adminId };

    const payments = await StudentPayment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await StudentPayment.countDocuments(filter);

    return sendSuccess(res, 200, 'Payment history retrieved successfully', { payments, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Payment history error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

/**
 * @function getInvoices
 * @description Retrieves all invoices for the authenticated student
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getInvoices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { student: req.user.id, adminId: req.user.adminId };

    const invoices = await StudentInvoice.find(filter)
      .sort({ issueDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await StudentInvoice.countDocuments(filter);

    return sendSuccess(res, 200, 'Invoices retrieved successfully', { invoices, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Invoices error:', error);
    return sendError(res, 500, 'Internal server error');
  }
};

module.exports = {
  login,
  getProfile,
  getPaymentHistory,
  getInvoices
};
