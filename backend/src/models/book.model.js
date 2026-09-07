const mongoose = require('mongoose');

/**
 * @file book.model.js
 * @description Mongoose model definition for Books in the Library Sathi SaaS platform.
 * Supports multi-tenant library cataloging, copy tracking, and ISBN indexing.
 */

/**
 * Book Schema
 *
 * @typedef {Object} Book
 * @property {mongoose.Types.ObjectId} _id - Auto-generated unique document identifier.
 * @property {mongoose.Types.ObjectId} adminId - Reference to the Admin (tenant owner).
 * @property {string} title - Book title.
 * @property {string} [author] - Author name.
 * @property {string} [ISBN] - International Standard Book Number.
 * @property {string} [publisher] - Publishing house name.
 * @property {string} [category] - Subject genre / category.
 * @property {number} totalCopies - Total copies owned by the library.
 * @property {number} availableCopies - Copies currently available for borrowing.
 * @property {string} [shelfLocation] - Physical rack or shelf location identifier.
 * @property {Object} [image] - Book cover image asset.
 * @property {string} [image.url] - URL to the image resource.
 * @property {string} [image.publicId] - Cloud storage asset public identifier.
 * @property {Date} createdAt - Timestamp when the record was created.
 * @property {Date} updatedAt - Timestamp when the record was last modified.
 * @property {boolean} isAvailable - Virtual getter checking if available copies > 0.
 */
const bookSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: [true, 'Admin ID (tenant) is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
    },
    author: {
      type: String,
      trim: true,
      default: '',
    },
    ISBN: {
      type: String,
      trim: true,
      default: null,
    },
    publisher: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      trim: true,
      default: '',
    },
    totalCopies: {
      type: Number,
      required: [true, 'Total copies count is required'],
      min: [1, 'Total copies must be at least 1'],
      default: 1,
    },
    availableCopies: {
      type: Number,
      required: [true, 'Available copies count is required'],
      min: [0, 'Available copies cannot be negative'],
      default: 1,
      validate: {
        validator: function (value) {
          if (this.totalCopies != null) {
            return value <= this.totalCopies;
          }
          return true;
        },
        message: 'Available copies ({VALUE}) cannot exceed total copies',
      },
    },
    shelfLocation: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound sparse unique index: ISBN must be unique per admin (tenant) when provided
bookSchema.index(
  { adminId: 1, ISBN: 1 },
  {
    unique: true,
    partialFilterExpression: { ISBN: { $type: 'string' } },
  }
);

// Compound indexes for tenant-scoped searching and filtering
bookSchema.index({ adminId: 1, title: 1 });
bookSchema.index({ adminId: 1, category: 1 });

/**
 * Virtual: isAvailable
 * Returns true if there is at least one copy available for issue.
 */
bookSchema.virtual('isAvailable').get(function () {
  return typeof this.availableCopies === 'number' && this.availableCopies > 0;
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
