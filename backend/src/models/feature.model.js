/**
 * @file feature.model.js
 * @description Mongoose model for individual SaaS features and add-ons in Library Sathi.
 * Features can be bundled into subscription plans or offered as standalone add-ons.
 */

const mongoose = require('mongoose');

/**
 * Feature Pricing Sub-schema
 */
const pricingSchema = new mongoose.Schema(
  {
    monthly: {
      type: Number,
      default: 0,
      min: [0, 'Monthly price cannot be negative'],
    },
    yearly: {
      type: Number,
      default: 0,
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
 * Feature Image Sub-schema
 */
const imageSchema = new mongoose.Schema(
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
 * Feature Schema definition
 * @typedef {Object} FeatureDocument
 * @property {mongoose.Types.ObjectId} _id - Unique identifier
 * @property {string} name - Feature display name
 * @property {string} code - Unique feature code (e.g. 'FEAT-001')
 * @property {string} [description] - Detailed feature description
 * @property {'basic' | 'premium' | 'addon'} type - Type classification of the feature
 * @property {Object} pricing - Pricing breakdown for standalone / add-on subscription
 * @property {number} pricing.monthly - Monthly subscription cost
 * @property {number} pricing.yearly - Annual subscription cost
 * @property {number} pricing.lifetime - Lifetime access cost
 * @property {Object} image - Feature image details
 * @property {string} image.url - CDN/Cloudinary image URL
 * @property {string} image.publicId - Asset public identifier
 * @property {boolean} isActive - Whether the feature is currently active
 * @property {Date} createdAt - Timestamp of creation
 * @property {Date} updatedAt - Timestamp of last update
 */
const featureSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Feature name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Feature name must be at least 2 characters long'],
      maxlength: [100, 'Feature name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Feature code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    type: {
      type: String,
      enum: {
        values: ['basic', 'premium', 'addon'],
        message: '{VALUE} is not a valid feature type. Allowed types: basic, premium, addon.',
      },
      default: 'basic',
    },
    pricing: {
      type: pricingSchema,
      default: () => ({ monthly: 0, yearly: 0, lifetime: 0 }),
    },
    image: {
      type: imageSchema,
      default: () => ({ url: '', publicId: '' }),
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

// Indexes on code (unique), type, isActive
featureSchema.index({ code: 1 }, { unique: true });
featureSchema.index({ type: 1 });
featureSchema.index({ isActive: 1 });

/**
 * Pre-validation hook to automatically generate feature code (e.g. FEAT-001) if not explicitly provided
 */
featureSchema.pre('validate', async function () {
  if (!this.code) {
    const lastFeature = await this.constructor.findOne(
      { code: /^FEAT-\d+$/ },
      { code: 1 },
      { sort: { code: -1 } }
    );

    let nextNumber = 1;
    if (lastFeature && lastFeature.code) {
      const match = lastFeature.code.match(/^FEAT-(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    this.code = `FEAT-${String(nextNumber).padStart(3, '0')}`;
  }
});

const Feature = mongoose.model('Feature', featureSchema);

module.exports = Feature;
