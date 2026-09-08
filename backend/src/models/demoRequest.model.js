/**
 * @file demoRequest.model.js
 * @description Mongoose model for Inbound Demo & Pricing Plan Inquiries in Library Sathi.
 */

const mongoose = require('mongoose');

const demoRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Contact phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      default: '',
    },
    libraryName: {
      type: String,
      required: [true, 'Library or study space name is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City or location is required'],
      trim: true,
    },
    seatCount: {
      type: String,
      default: '50-100',
      trim: true,
    },
    preferredTime: {
      type: String,
      default: 'morning',
      trim: true,
    },
    selectedPlan: {
      type: String,
      default: 'General Demo',
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'contacted', 'demo_scheduled', 'converted', 'rejected'],
      default: 'pending',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

demoRequestSchema.index({ status: 1, createdAt: -1 });

const DemoRequest = mongoose.model('DemoRequest', demoRequestSchema);

module.exports = DemoRequest;
