const mongoose = require('mongoose');

/**
 * @file locker.model.js
 * @description Mongoose model definition for Lockers in the Library Sathi SaaS platform.
 * Provides multi-tenant locker allocation, status management, and synchronization hooks.
 */

/**
 * Locker Schema
 *
 * @typedef {Object} Locker
 * @property {mongoose.Types.ObjectId} _id - Auto-generated unique document identifier.
 * @property {mongoose.Types.ObjectId} adminId - Reference to the Admin (tenant owner).
 * @property {string} lockerNumber - Locker identifier/number within the library.
 * @property {'small'|'medium'|'large'} size - Physical size of the locker.
 * @property {number} price - Rental fee/price for the locker.
 * @property {boolean} isOccupied - Boolean flag indicating if the locker is occupied.
 * @property {mongoose.Types.ObjectId|null} studentId - Reference to the assigned Student.
 * @property {'available'|'occupied'|'maintenance'} status - Operational status of the locker.
 * @property {Date} createdAt - Timestamp when the record was created.
 * @property {Date} updatedAt - Timestamp when the record was last modified.
 */
const lockerSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: [true, 'Admin ID (tenant) is required'],
      index: true,
    },
    lockerNumber: {
      type: String,
      required: [true, 'Locker number is required'],
      trim: true,
    },
    size: {
      type: String,
      enum: {
        values: ['small', 'medium', 'large'],
        message: 'Locker size must be one of: small, medium, large',
      },
      default: 'medium',
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative'],
    },
    isOccupied: {
      type: Boolean,
      default: false,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ['available', 'occupied', 'maintenance'],
        message: 'Status must be one of: available, occupied, maintenance',
      },
      default: 'available',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound unique index: lockerNumber must be unique per admin (tenant)
lockerSchema.index({ adminId: 1, lockerNumber: 1 }, { unique: true });

// Compound indexes for tenant-scoped query performance
lockerSchema.index({ adminId: 1, status: 1 });
lockerSchema.index({ adminId: 1, isOccupied: 1 });

/**
 * Pre-save hook to ensure synchronization between `status` and `isOccupied`.
 *
 * Rules:
 * - If status is 'occupied', isOccupied is set to true.
 * - If status is 'available' or 'maintenance', isOccupied is set to false.
 * - If isOccupied was directly modified to true, status is set to 'occupied'.
 * - If isOccupied was directly modified to false while status was 'occupied', status is set to 'available'.
 * - If status becomes 'available' and studentId was not explicitly updated, studentId is cleared to null.
 */
lockerSchema.pre('save', function () {
  if (this.isModified('status')) {
    if (this.status === 'occupied') {
      this.isOccupied = true;
    } else {
      this.isOccupied = false;
      if (this.status === 'available' && !this.isModified('studentId')) {
        this.studentId = null;
      }
    }
  } else if (this.isModified('isOccupied')) {
    if (this.isOccupied) {
      this.status = 'occupied';
    } else if (this.status === 'occupied') {
      this.status = 'available';
      if (!this.isModified('studentId')) {
        this.studentId = null;
      }
    }
  } else {
    // Fallback sync on initial creation or full updates
    if (this.status === 'occupied') {
      this.isOccupied = true;
    } else {
      this.isOccupied = false;
    }
  }
});

const Locker = mongoose.model('Locker', lockerSchema);

module.exports = Locker;
