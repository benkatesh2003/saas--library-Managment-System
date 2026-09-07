const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * @typedef {Object} StudentImage
 * @property {string|null} url - Image URL
 * @property {string|null} publicId - Cloudinary/S3 public ID
 *
 * @typedef {Object} StudentSeat
 * @property {mongoose.Types.ObjectId|null} seatId - Reference to assigned Seat
 * @property {string|null} seatNumber - Seat number identifier
 *
 * @typedef {Object} StudentShift
 * @property {mongoose.Types.ObjectId|null} shiftId - Reference to assigned Shift
 * @property {string|null} shiftName - Name of the assigned shift
 *
 * @typedef {Object} StudentLocker
 * @property {mongoose.Types.ObjectId|null} lockerId - Reference to assigned Locker
 * @property {string|null} lockerNumber - Locker number identifier
 *
 * @typedef {Object} StudentSubscription
 * @property {Date} startDate - Subscription start date
 * @property {Date} endDate - Subscription expiry date
 * @property {number} duration - Subscription duration in months
 */

/**
 * Student Schema for Library Sathi Multi-Tenant SaaS Platform.
 * Represents an enrolled student/member registered under a specific library admin (tenant).
 */
const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      trim: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: [true, 'Admin reference is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: null,
      validate: {
        validator: function (v) {
          return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please provide a valid email address',
      },
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    password: {
      type: String,
      select: false,
    },
    image: {
      url: {
        type: String,
        trim: true,
        default: null,
      },
      publicId: {
        type: String,
        trim: true,
        default: null,
      },
    },
    address: {
      type: String,
      trim: true,
      default: null,
    },
    seat: {
      seatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seat',
        default: null,
      },
      seatNumber: {
        type: String,
        trim: true,
        default: null,
      },
    },
    shift: {
      shiftId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shift',
        default: null,
      },
      shiftName: {
        type: String,
        trim: true,
        default: null,
      },
    },
    locker: {
      lockerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Locker',
        default: null,
      },
      lockerNumber: {
        type: String,
        trim: true,
        default: null,
      },
    },
    subscription: {
      startDate: {
        type: Date,
        required: [true, 'Subscription start date is required'],
      },
      endDate: {
        type: Date,
        required: [true, 'Subscription end date is required'],
      },
      duration: {
        type: Number,
        default: 1,
        min: [1, 'Subscription duration must be at least 1 month'],
      },
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['due', 'partial', 'paid', 'advance'],
        message: '`{VALUE}` is not a valid payment status (must be due, partial, paid, or advance)',
      },
      default: 'due',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    admissionDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------
studentSchema.index({ adminId: 1, isActive: 1 });
studentSchema.index({ adminId: 1, studentId: 1 }, { unique: true });
studentSchema.index({ adminId: 1, paymentStatus: 1 });

// ---------------------------------------------------------------------------
// Virtuals
// ---------------------------------------------------------------------------
/**
 * Virtual property to check if the student's subscription has expired.
 * @returns {boolean}
 */
studentSchema.virtual('isSubscriptionExpired').get(function () {
  if (!this.subscription || !this.subscription.endDate) {
    return false;
  }
  return new Date() > new Date(this.subscription.endDate);
});

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------
/**
 * Pre-save middleware to automatically hash the student password using bcryptjs.
 */
studentSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ---------------------------------------------------------------------------
// Instance Methods
// ---------------------------------------------------------------------------
/**
 * Compares a plain text candidate password with the stored hashed password.
 * @param {string} candidatePassword - Plain text password to verify
 * @returns {Promise<boolean>}
 */
studentSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);

module.exports = Student;
