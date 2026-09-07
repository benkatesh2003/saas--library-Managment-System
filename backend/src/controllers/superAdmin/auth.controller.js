const { SuperAdmin } = require('../../models');
const { sendSuccess, sendError } = require('../../utils/response');
const { generateToken } = require('../../utils/jwtHelper');

/**
 * @desc    Register a new Super Admin
 * @route   POST /api/super-admin/auth/register
 * @access  Public (Should ideally be restricted or run once)
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if super admin already exists
    const existingAdmin = await SuperAdmin.findOne({ email });
    if (existingAdmin) {
      return sendError(res, 400, 'Super Admin already exists with this email');
    }

    const superAdmin = await SuperAdmin.create({
      name,
      email,
      password
    });

    const token = generateToken({ id: superAdmin._id, email: superAdmin.email, role: 'super-admin' });

    const adminData = {
      _id: superAdmin._id,
      name: superAdmin.name,
      email: superAdmin.email
    };

    return sendSuccess(res, 201, 'Super Admin registered successfully', { token, user: adminData });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

/**
 * @desc    Login Super Admin
 * @route   POST /api/super-admin/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find super admin by email and select password
    const superAdmin = await SuperAdmin.findOne({ email }).select('+password');
    if (!superAdmin) {
      return sendError(res, 401, 'Invalid email or password');
    }

    // Check if password matches
    const isMatch = await superAdmin.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password');
    }

    const token = generateToken({ id: superAdmin._id, email: superAdmin.email, role: 'super-admin' });

    const adminData = {
      _id: superAdmin._id,
      name: superAdmin.name,
      email: superAdmin.email
    };

    return sendSuccess(res, 200, 'Login successful', { token, user: adminData });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

/**
 * @desc    Get current Super Admin profile
 * @route   GET /api/super-admin/auth/profile
 * @access  Private (Super Admin)
 */
exports.getProfile = async (req, res) => {
  try {
    const superAdmin = await SuperAdmin.findById(req.user.id);
    if (!superAdmin) {
      return sendError(res, 404, 'Super Admin not found');
    }

    return sendSuccess(res, 200, 'Profile fetched successfully', { user: superAdmin });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};
