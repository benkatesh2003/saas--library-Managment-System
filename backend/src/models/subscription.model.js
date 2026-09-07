/**
 * @file subscription.model.js
 * @description Mongoose model for Subscriptions in the Library Sathi SaaS multi-tenant platform.
 * Manages tenant subscription lifecycles, billing cycles, Razorpay payment records, and active state.
 */

const mongoose = require('mongoose');

/**
 * Subscription Schema definition.
 * Tracks subscription plans, custom features, payment statuses, and date ranges for tenant admins.
 */
const subscriptionSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: [true, 'Admin ID is required'],
      index: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: [true, 'Plan ID is required'],
    },
    customFeatures: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Feature',
      },
    ],
    billingCycle: {
      type: String,
      enum: {
        values: ['monthly', 'yearly', 'lifetime'],
        message: '{VALUE} is not a valid billing cycle (monthly, yearly, lifetime required)',
      },
      required: [true, 'Billing cycle is required'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
    },
    finalAmount: {
      type: Number,
      required: [true, 'Final amount is required'],
      min: [0, 'Final amount cannot be negative'],
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['created', 'pending', 'paid', 'failed', 'expired'],
        message: '{VALUE} is not a valid payment status (created, pending, paid, failed, expired required)',
      },
      default: 'created',
      index: true,
    },
    razorpayOrderId: {
      type: String,
      trim: true,
    },
    razorpayPaymentId: {
      type: String,
      trim: true,
    },
    razorpaySignature: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    autoRenew: {
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

// Indexes for high-frequency queries
subscriptionSchema.index({ adminId: 1 });
subscriptionSchema.index({ paymentStatus: 1 });
subscriptionSchema.index({ startDate: 1, endDate: 1 });
subscriptionSchema.index({ razorpayOrderId: 1 });

/**
 * Virtual: isExpired
 * Evaluates whether the subscription has passed its end date.
 * Returns false if endDate is not defined (e.g. lifetime subscription).
 * 
 * @returns {boolean} True if current date is past endDate, false otherwise.
 */
subscriptionSchema.virtual('isExpired').get(function () {
  if (!this.endDate) {
    return false;
  }
  return new Date() > new Date(this.endDate);
});

/**
 * Pre-save Hook:
 * Automatically activates subscription (`isActive = true`) when `paymentStatus` is updated to 'paid'.
 */
subscriptionSchema.pre('save', function () {
  if (this.isModified('paymentStatus') && this.paymentStatus === 'paid') {
    this.isActive = true;
  }
});

const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
