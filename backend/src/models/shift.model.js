const mongoose = require('mongoose');

/**
 * Shift Schema for Library Sathi Multi-Tenant SaaS Platform.
 * Represents a study slot or timing shift configured by a library tenant.
 */
const shiftSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: [true, 'Admin reference is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Shift name is required'],
      trim: true,
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      trim: true,
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Shift price is required'],
      min: [0, 'Shift price cannot be negative'],
    },
    maxStudents: {
      type: Number,
      default: -1, // -1 indicates unlimited capacity
    },
    currentStudents: {
      type: Number,
      default: 0,
      min: [0, 'Current student count cannot be negative'],
    },
    isActive: {
      type: Boolean,
      default: true,
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
// Compound unique index ensuring shift names are distinct per tenant/admin
shiftSchema.index({ adminId: 1, name: 1 }, { unique: true });

// ---------------------------------------------------------------------------
// Virtuals
// ---------------------------------------------------------------------------
/**
 * Virtual property to determine if the shift has reached maximum student capacity.
 * If maxStudents is <= 0 (e.g. default -1), capacity is considered unlimited and returns false.
 * @returns {boolean}
 */
shiftSchema.virtual('isFull').get(function () {
  if (this.maxStudents > 0) {
    return this.currentStudents >= this.maxStudents;
  }
  return false;
});

const Shift = mongoose.models.Shift || mongoose.model('Shift', shiftSchema);

module.exports = Shift;
