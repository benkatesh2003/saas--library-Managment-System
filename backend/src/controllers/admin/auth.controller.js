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
    const token = req.body?.token || req.body?.credential;
    if (!token) {
      return sendError(res, 400, 'Google token is required');
    }
    
    let payload;
    try {
      payload = await verifyGoogleToken(token);
    } catch (verifyErr) {
      return sendError(res, 401, 'Google token verification failed', verifyErr.message);
    }

    if (!payload || !payload.email) {
      return sendError(res, 401, 'Invalid Google token payload');
    }
    
    const { email, name, picture } = payload;
    const googleId = payload.googleId || payload.sub;
    const firstName = payload.given_name || (name ? name.split(' ')[0] : 'Admin');
    const lastName = payload.family_name || (name ? name.split(' ').slice(1).join(' ') : '');
    
    let admin = await Admin.findOne({ $or: [{ email: email.toLowerCase() }, { googleId }] });
    
    if (admin) {
      // Link Google ID if not yet linked
      if (!admin.googleId) {
        admin.googleId = googleId;
      }
      admin.lastLogin = Date.now();
      if (picture && (!admin.avatar || !admin.avatar.url)) {
        admin.avatar = { url: picture, publicId: '' };
      }
      await admin.save({ validateBeforeSave: false });
    } else {
      // New Admin registering via Google
      const libraryId = await generateLibraryId();
      const crypto = require('crypto');
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const libraryName = `${firstName}'s Library`;
      
      admin = new Admin({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: randomPassword,
        googleId,
        libraryName,
        avatar: { url: picture || '', publicId: '' },
        libraryId,
        isVerified: true
      });
      await admin.save();
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
