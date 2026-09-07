const mongoose = require('mongoose');

/**
 * Seat Schema for Library Sathi Multi-Tenant SaaS Platform.
 * Represents an individual physical seat within a library tenant.
 */
const seatSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: [true, 'Admin reference is required'],
      index: true,
    },
    seatNumber: {
      type: String,
      required: [true, 'Seat number is required'],
      trim: true,
    },
    floor: {
      type: String,
      trim: true,
      default: 'Ground',
    },
    section: {
      type: String,
      trim: true,
      default: null,
    },
    reservedFor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ['available', 'occupied', 'maintenance', 'reserved'],
        message: '`{VALUE}` is not a valid seat status (must be available, occupied, maintenance, or reserved)',
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

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------
// Compound unique index to prevent duplicate seat numbers within the same tenant/admin
seatSchema.index({ adminId: 1, seatNumber: 1 }, { unique: true });

// Index to optimize querying seats by status per tenant/admin
seatSchema.index({ adminId: 1, status: 1 });

const Seat = mongoose.models.Seat || mongoose.model('Seat', seatSchema);

module.exports = Seat;
