/**
 * @file superAdmin.model.js
 * @description Mongoose model for Super Admin users in Library Sathi SaaS platform.
 * Handles system-level authentication, authorization, and administrative operations.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Super Admin Schema definition
 * @typedef {Object} SuperAdminDocument
 * @property {mongoose.Types.ObjectId} _id - Unique identifier
 * @property {string} name - Full name of the super admin
 * @property {string} email - Unique email address (used for login)
 * @property {string} password - Hashed password (hidden by default in queries)
 * @property {string} role - User role, restricted to 'super-admin'
 * @property {Date} createdAt - Timestamp of creation
 * @property {Date} updatedAt - Timestamp of last update
 */
const superAdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['super-admin'],
        message: '{VALUE} is not a valid role. Only super-admin is allowed.',
      },
      default: 'super-admin',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

/**
 * Pre-save middleware to hash password with bcryptjs before saving
 */
superAdminSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Compare plain text candidate password with hashed password in database
 * @param {string} candidatePassword - Plain text password to compare
 * @returns {Promise<boolean>} Resolves to true if password matches, false otherwise
 */
superAdminSchema.methods.comparePassword = async function (candidatePassword) {
  if (!candidatePassword || !this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

const SuperAdmin = mongoose.model('SuperAdmin', superAdminSchema);

module.exports = SuperAdmin;
