/**
 * @fileoverview Central Model Registry
 * @module models/index
 *
 * Exports all Mongoose models from a single entry point.
 * Import models from this file to ensure consistent model registration.
 *
 * @example
 * const { Admin, Student, Seat } = require('./models');
 */

const SuperAdmin = require('./superAdmin.model');
const Feature = require('./feature.model');
const Plan = require('./plan.model');
const Subscription = require('./subscription.model');
const Admin = require('./admin.model');
const Student = require('./student.model');
const Seat = require('./seat.model');
const Shift = require('./shift.model');
const Locker = require('./locker.model');
const Book = require('./book.model');
const BookIssue = require('./bookIssue.model');
const StudentPayment = require('./studentPayment.model');
const StudentInvoice = require('./studentInvoice.model');
const DemoRequest = require('./demoRequest.model');

module.exports = {
  // ─── Platform Level ────────────────────────────────
  SuperAdmin,
  Feature,
  Plan,
  Subscription,
  DemoRequest,

  // ─── Tenant Level ──────────────────────────────────
  Admin,
  Student,
  Seat,
  Shift,
  Locker,
  Book,
  BookIssue,

  // ─── Financial ─────────────────────────────────────
  StudentPayment,
  StudentInvoice,
};
