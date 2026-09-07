const mongoose = require('mongoose');

/**
 * @file bookIssue.model.js
 * @description Mongoose model definition for Book Issues in the Library Sathi SaaS platform.
 * Tracks book circulation, due dates, returns, overdue calculations, and fines.
 */

/**
 * BookIssue Schema
 *
 * @typedef {Object} BookIssue
 * @property {mongoose.Types.ObjectId} _id - Auto-generated unique document identifier.
 * @property {mongoose.Types.ObjectId} adminId - Reference to the Admin (tenant owner).
 * @property {mongoose.Types.ObjectId} bookId - Reference to the issued Book.
 * @property {mongoose.Types.ObjectId} studentId - Reference to the borrowing Student.
 * @property {Date} issueDate - Date when the book was issued.
 * @property {Date} dueDate - Date by which the book must be returned.
 * @property {Date|null} returnDate - Actual date when the book was returned.
 * @property {number} fine - Recorded or finalized fine amount.
 * @property {number} finePerDay - Fine charged per day after the due date.
 * @property {'issued'|'returned'|'overdue'|'lost'} status - Current status of the issue record.
 * @property {string} [notes] - Additional remarks or notes.
 * @property {Date} createdAt - Timestamp when the record was created.
 * @property {Date} updatedAt - Timestamp when the record was last modified.
 * @property {boolean} isOverdue - Virtual getter checking if due date has passed for an issued book.
 * @property {number} calculatedFine - Virtual getter computing total fine accrued based on overdue days and finePerDay.
 */
const bookIssueSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: [true, 'Admin ID (tenant) is required'],
      index: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book ID is required'],
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    returnDate: {
      type: Date,
      default: null,
    },
    fine: {
      type: Number,
      default: 0,
      min: [0, 'Fine cannot be negative'],
    },
    finePerDay: {
      type: Number,
      default: 0,
      min: [0, 'Fine per day cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: ['issued', 'returned', 'overdue', 'lost'],
        message: 'Status must be one of: issued, returned, overdue, lost',
      },
      default: 'issued',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for tenant-scoped operations and queries
bookIssueSchema.index({ adminId: 1, status: 1 });
bookIssueSchema.index({ adminId: 1, bookId: 1 });
bookIssueSchema.index({ adminId: 1, studentId: 1 });
bookIssueSchema.index({ dueDate: 1, status: 1 });

/**
 * Virtual: isOverdue
 * Returns true if the due date has passed and the status is 'issued'.
 */
bookIssueSchema.virtual('isOverdue').get(function () {
  if (!this.dueDate) {
    return false;
  }
  return new Date(this.dueDate) < new Date() && this.status === 'issued';
});

/**
 * Virtual: calculatedFine
 * Computes the accrued fine based on elapsed days past dueDate multiplied by finePerDay.
 * Uses returnDate if returned, otherwise uses the current timestamp.
 */
bookIssueSchema.virtual('calculatedFine').get(function () {
  if (!this.dueDate || !this.finePerDay || this.finePerDay <= 0) {
    return 0;
  }

  const effectiveEndDate = this.returnDate ? new Date(this.returnDate) : new Date();
  const due = new Date(this.dueDate);

  if (effectiveEndDate <= due) {
    return 0;
  }

  const diffInMs = effectiveEndDate.getTime() - due.getTime();
  const overdueDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  return Math.max(0, overdueDays * this.finePerDay);
});

const BookIssue = mongoose.model('BookIssue', bookIssueSchema);

module.exports = BookIssue;
