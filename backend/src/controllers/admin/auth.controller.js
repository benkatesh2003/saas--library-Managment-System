const { Admin, Subscription } = require('../../models');
const { sendSuccess, sendError } = require('../../utils/response');
const { generateToken } = require('../../utils/jwtHelper');
const { generateLibraryId } = require('../../utils/idGenerator');
const { verifyGoogleToken } = require('../../utils/googleAuth');

/**
 * @desc    Register new admin
 * @route   POST /api/v1/admin/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, libraryName, address } = req.body;
    
    // Check if email exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return sendError(res, 400, 'Email already registered');
    }
    
    const libraryId = await generateLibraryId();
    
    const admin = new Admin({
      firstName,
      lastName,
      email,
      password,
      phone,
      libraryName,
      libraryId,
      address
    });
    
    await admin.save();
    
    const token = generateToken({ id: admin._id, email: admin.email, role: 'admin' });
    
    const adminData = admin.toObject();
    delete adminData.password;
    
    return sendSuccess(res, 201, 'Registration successful', { token, admin: adminData });
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Admin login
 * @route   POST /api/v1/admin/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return sendError(res, 401, 'Invalid credentials');
    }
    
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid credentials');
    }
    
    admin.lastLogin = Date.now();
    await admin.save({ validateBeforeSave: false });
    
    const token = generateToken({ id: admin._id, email: admin.email, role: 'admin' });
    
    const adminData = admin.toObject();
    delete adminData.password;
    
    return sendSuccess(res, 200, 'Login successful', { token, admin: adminData });
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Admin Google login
 * @route   POST /api/v1/admin/auth/google
 * @access  Public
 */
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    
    const payload = await verifyGoogleToken(token);
    if (!payload) {
      return sendError(res, 401, 'Invalid Google token');
    }
    
    const { email, given_name, family_name, sub, picture } = payload;
    
    let admin = await Admin.findOne({ $or: [{ email }, { googleId: sub }] });
    
    if (!admin) {
      const libraryId = await generateLibraryId();
      admin = new Admin({
        firstName: given_name,
        lastName: family_name,
        email,
        googleId: sub,
        avatar: picture,
        libraryId,
        isVerified: true
      });
      await admin.save();
    } else {
      admin.lastLogin = Date.now();
      if (!admin.googleId) admin.googleId = sub;
      await admin.save({ validateBeforeSave: false });
    }
    
    const jwtToken = generateToken({ id: admin._id, email: admin.email, role: 'admin' });
    
    return sendSuccess(res, 200, 'Google login successful', { token: jwtToken, admin });
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Get admin profile
 * @route   GET /api/v1/admin/auth/profile
 * @access  Private (Admin)
 */
exports.getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).populate('subscriptionId');
    if (!admin) {
      return sendError(res, 404, 'Admin not found');
    }
    
    return sendSuccess(res, 200, 'Profile retrieved', { admin });
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Update admin profile
 * @route   PUT /api/v1/admin/auth/profile
 * @access  Private (Admin)
 */
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, libraryName, address, avatar } = req.body;
    
    const admin = await Admin.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, phone, libraryName, address, avatar },
      { new: true, runValidators: true }
    );
    
    if (!admin) {
      return sendError(res, 404, 'Admin not found');
    }
    
    return sendSuccess(res, 200, 'Profile updated', { admin });
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};
