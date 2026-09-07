/**
 * @file plan.model.js
 * @description Mongoose model for Subscription Plans in Library Sathi SaaS platform.
 * Defines plan tiers, associated features, pricing tiers, discount options, and resource limits.
 */

const mongoose = require('mongoose');

/**
 * Plan Pricing Sub-schema
 */
const planPricingSchema = new mongoose.Schema(
  {
    monthly: {
      type: Number,
      required: [true, 'Monthly price is required'],
      min: [0, 'Monthly price cannot be negative'],
    },
    yearly: {
      type: Number,
      required: [true, 'Yearly price is required'],
      min: [0, 'Yearly price cannot be negative'],
    },
    lifetime: {
      type: Number,
      default: 0,
      min: [0, 'Lifetime price cannot be negative'],
    },
  },
  { _id: false }
);

/**
 * Plan Discount Sub-schema
 */
const planDiscountSchema = new mongoose.Schema(
  {
    percentage: {
      type: Number,
      default: 0,
      min: [0, 'Discount percentage cannot be less than 0'],
      max: [100, 'Discount percentage cannot exceed 100'],
    },
    validTill: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

/**
 * Plan Schema definition
 * @typedef {Object} PlanDocument
 * @property {mongoose.Types.ObjectId} _id - Unique identifier
 * @property {string} name - Unique plan name (e.g., 'Starter', 'Standard', 'Enterprise')
 * @property {string} [description] - Detailed plan description
 * @property {mongoose.Types.ObjectId[]} features - Array of references to Feature documents
 * @property {Object} pricing - Pricing structure
 * @property {number} pricing.monthly - Monthly subscription cost (required)
 * @property {number} pricing.yearly - Annual subscription cost (required)
 * @property {number} pricing.lifetime - Lifetime access subscription cost (default 0)
 * @property {Object} discount - Discount configuration
 * @property {number} discount.percentage - Discount percentage (0-100)
 * @property {Date|null} discount.validTill - Expiry date for the discount
 * @property {number} maxStudents - Maximum student capacity (-1 for unlimited)
 * @property {number} maxSeats - Maximum library seat capacity (-1 for unlimited)
 * @property {boolean} isActive - Whether the plan is active and available for subscription
 * @property {boolean} isDiscountValid - Virtual property checking if discount is currently active
 * @property {Date} createdAt - Timestamp of creation
 * @property {Date} updatedAt - Timestamp of last update
 */
const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Plan name must be at least 2 characters long'],
      maxlength: [100, 'Plan name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    features: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Feature',
      },
    ],
    pricing: {
      type: planPricingSchema,
      required: [true, 'Plan pricing is required'],
    },
    discount: {
      type: planDiscountSchema,
      default: () => ({ percentage: 0, validTill: null }),
    },
    maxStudents: {
      type: Number,
      default: -1,
      validate: {
        validator: function (value) {
          return Number.isInteger(value) && (value === -1 || value > 0);
        },
        message: 'maxStudents must be -1 (unlimited) or a positive integer',
      },
    },
    maxSeats: {
      type: Number,
      default: -1,
      validate: {
        validator: function (value) {
          return Number.isInteger(value) && (value === -1 || value > 0);
        },
        message: 'maxSeats must be -1 (unlimited) or a positive integer',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes on name (unique), isActive
planSchema.index({ name: 1 }, { unique: true });
planSchema.index({ isActive: 1 });

/**
 * Virtual: isDiscountValid
 * Evaluates whether the plan has an active and unexpired discount.
 * @returns {boolean} True if discount percentage is > 0 and validTill is in future (or not set), false otherwise.
 */
planSchema.virtual('isDiscountValid').get(function () {
  if (!this.discount || !this.discount.percentage || this.discount.percentage <= 0) {
    return false;
  }

  if (!this.discount.validTill) {
    return true;
  }

  return new Date(this.discount.validTill).getTime() > Date.now();
});

const Plan = mongoose.model('Plan', planSchema);

module.exports = Plan;
