/**
 * @file admin.model.js
 * @description Mongoose model for Library Admins (Tenants) in the Library Sathi SaaS platform.
 * Supports authentication, password hashing with bcryptjs, OAuth identifiers, role-based access, and tenant-level metadata.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Nested address schema for library admin/branch location details.
 */
const addressSchema = new mongoose.Schema(
  {
    street: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    state: {
      type: String,
      trim: true,
      default: '',
    },
    pincode: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: false }
);

/**
 * Nested avatar schema for admin profile picture stored on cloud storage (e.g., Cloudinary/S3).
 */
const avatarSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      trim: true,
      default: '',
    },
    publicId: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: false }
);

/**
 * Admin Schema definition.
 * Represents the primary tenant admin managing a library on Library Sathi.
 */
const adminSchema = new mongoose.Schema(
  {
    libraryId: {
      type: String,
      required: [true, 'Library ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    libraryName: {
      type: String,
      required: [true, 'Library name is required'],
      trim: true,
    },
    address: {
      type: addressSchema,
      default: () => ({}),
    },
    googleId: {
      type: String,
      sparse: true,
      trim: true,
    },
    avatar: {
      type: avatarSchema,
      default: () => ({}),
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      default: null,
    },
    activeFeatures: {
      type: [String],
      default: [],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: {
        values: ['admin'],
        message: '{VALUE} is not an authorized admin role',
      },
      default: 'admin',
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Indexes
// adminSchema.index({ email: 1 }, { unique: true });
// adminSchema.index({ libraryId: 1 }, { unique: true });
adminSchema.index({ googleId: 1 }, { unique: true, sparse: true });

/**
 * Virtual: fullName
 * Concatenates firstName and lastName.
 * 
 * @returns {string} Full name of the admin.
 */
adminSchema.virtual('fullName').get(function () {
  const parts = [this.firstName, this.lastName].filter(Boolean);
  return parts.join(' ').trim();
});

/**
 * Pre-save Hook:
 * Automatically hashes the admin's password with bcryptjs (10 salt rounds) when modified or newly created.
 */
adminSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Instance Method: comparePassword
 * Compares a candidate plaintext password against the hashed password.
 * Note: If querying with default select: false on password, ensure `.select('+password')` was used.
 * 
 * @param {string} candidatePassword - Plaintext password to verify.
 * @returns {Promise<boolean>} True if password matches, false otherwise.
 */
adminSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password || !candidatePassword) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

module.exports = Admin;
