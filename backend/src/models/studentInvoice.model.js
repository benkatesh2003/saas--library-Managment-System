/**
 * @file studentInvoice.model.js
 * @description Mongoose model for Student Invoices in the Library Sathi multi-tenant SaaS platform.
 * Represents formal billing invoices and receipts generated upon student fee payments,
 * featuring auto-generated sequential invoice numbers (e.g. INV-20260827-00001), itemized breakdowns,
 * and tenant-scoped tracking.
 */

const mongoose = require('mongoose');

/**
 * Line item subdocument schema for itemized invoice breakdowns.
 */
const invoiceLineItemSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, 'Line item description is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Line item amount is required'],
      min: [0, 'Line item amount cannot be negative'],
    },
  },
  { _id: false }
);

/**
 * Student Invoice Schema
 *
 * @typedef {Object} InvoiceLineItem
 * @property {string} description - Item description (e.g., 'Morning Shift Fee', 'Locker #12').
 * @property {number} amount - Charge for this line item.
 *
 * @typedef {Object} StudentInvoice
 * @property {mongoose.Types.ObjectId} _id - Unique auto-generated document identifier.
 * @property {string} invoiceNumber - Formatted invoice number (e.g., 'INV-20260827-00001').
 * @property {mongoose.Types.ObjectId} studentId - Reference to the Student.
 * @property {mongoose.Types.ObjectId} adminId - Reference to the Admin (tenant owner).
 * @property {mongoose.Types.ObjectId} paymentId - Reference to the associated StudentPayment.
 * @property {InvoiceLineItem[]} lineItems - Array of itemized invoice items.
 * @property {number} totalPayable - Subtotal of all charges before discount.
 * @property {number} discount - Discount applied to this invoice.
 * @property {number} finalAmount - Net invoice amount (totalPayable - discount).
 * @property {number} amountPaidNow - Amount paid in this transaction.
 * @property {number} amountDue - Remaining balance due after this invoice payment.
 * @property {string} paymentMethod - Mode of payment (cash, upi, card, etc.).
 * @property {Date} generatedAt - Date and time when the invoice was generated.
 * @property {string} notes - Additional notes or terms printed on invoice.
 * @property {Date} createdAt - Timestamp when record was created.
 * @property {Date} updatedAt - Timestamp when record was last updated.
 * @property {boolean} isSettled - Virtual getter indicating if invoice balance is zero.
 */
const studentInvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
      index: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: [true, 'Admin ID is required'],
      index: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentPayment',
      required: [true, 'Payment ID is required'],
      index: true,
    },
    lineItems: {
      type: [invoiceLineItemSchema],
      default: [],
    },
    totalPayable: {
      type: Number,
      required: [true, 'Total payable amount is required'],
      min: [0, 'Total payable amount cannot be negative'],
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
    amountPaidNow: {
      type: Number,
      required: [true, 'Amount paid now is required'],
      min: [0, 'Amount paid now cannot be negative'],
    },
    amountDue: {
      type: Number,
      default: 0,
      min: [0, 'Amount due cannot be negative'],
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['cash', 'upi', 'card', 'bank_transfer', 'razorpay', 'other'],
        message: '{VALUE} is not a valid payment method',
      },
      default: 'cash',
      trim: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
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

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------
// Query invoices by tenant and student
studentInvoiceSchema.index({ adminId: 1, studentId: 1 });

// Query invoices by tenant and generation timestamp (descending for latest first)
studentInvoiceSchema.index({ adminId: 1, generatedAt: -1 });

// Query invoices by tenant and associated payment ID
studentInvoiceSchema.index({ adminId: 1, paymentId: 1 });

// Unique index on invoiceNumber is defined in field definition and explicitly reinforced here
studentInvoiceSchema.index({ invoiceNumber: 1 }, { unique: true });

// ---------------------------------------------------------------------------
// Virtuals
// ---------------------------------------------------------------------------
/**
 * Virtual: isSettled
 * Returns true if there is no remaining balance due on this invoice.
 *
 * @returns {boolean}
 */
studentInvoiceSchema.virtual('isSettled').get(function () {
  return typeof this.amountDue === 'number' ? this.amountDue === 0 : false;
});

/**
 * Virtual: balanceDue
 * Returns non-negative remaining balance due.
 *
 * @returns {number}
 */
studentInvoiceSchema.virtual('balanceDue').get(function () {
  const finalAmt = typeof this.finalAmount === 'number' ? this.finalAmount : 0;
  const paidNow = typeof this.amountPaidNow === 'number' ? this.amountPaidNow : 0;
  return Math.max(0, finalAmt - paidNow);
});

// ---------------------------------------------------------------------------
// Static Methods
// ---------------------------------------------------------------------------
/**
 * Generates a unique, formatted invoice number in the format `INV-YYYYMMDD-XXXXX`.
 * E.g., `INV-20260827-00001`.
 *
 * @param {mongoose.Types.ObjectId|string} [adminId] - Tenant admin ID for context.
 * @param {Date|string|number} [date=new Date()] - Reference date for the invoice number date component.
 * @returns {Promise<string>} Generated unique invoice number string.
 */
studentInvoiceSchema.statics.generateInvoiceNumber = async function (adminId, date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  const prefix = `INV-${dateStr}-`;

  // Find the highest sequence invoice number created on the same day
  const lastInvoice = await this.findOne({
    invoiceNumber: { $regex: `^${prefix}` },
  })
    .sort({ invoiceNumber: -1 })
    .select('invoiceNumber')
    .lean();

  let nextSequence = 1;
  if (lastInvoice && lastInvoice.invoiceNumber) {
    const parts = lastInvoice.invoiceNumber.split('-');
    if (parts.length === 3) {
      const currentSeq = parseInt(parts[2], 10);
      if (!isNaN(currentSeq)) {
        nextSequence = currentSeq + 1;
      }
    }
  }

  const formattedSeq = String(nextSequence).padStart(5, '0');
  return `${prefix}${formattedSeq}`;
};

// ---------------------------------------------------------------------------
// Middleware Hooks
// ---------------------------------------------------------------------------
/**
 * Pre-validate hook:
 * 1. Auto-generates `invoiceNumber` if not provided before schema validation runs.
 * 2. Calculates `amountDue` if not explicitly set.
 */
studentInvoiceSchema.pre('validate', async function () {
  if (!this.invoiceNumber) {
    this.invoiceNumber = await this.constructor.generateInvoiceNumber(
      this.adminId,
      this.generatedAt || new Date()
    );
  }

  if (this.amountDue === undefined || this.amountDue === null) {
    const finalAmt = typeof this.finalAmount === 'number' ? this.finalAmount : 0;
    const paidAmt = typeof this.amountPaidNow === 'number' ? this.amountPaidNow : 0;
    this.amountDue = Math.max(0, finalAmt - paidAmt);
  }
});

/**
 * Pre-save hook:
 * Re-calculates `amountDue` if `finalAmount` or `amountPaidNow` was modified.
 */
studentInvoiceSchema.pre('save', function () {
  if (this.isModified('finalAmount') || this.isModified('amountPaidNow')) {
    const finalAmt = typeof this.finalAmount === 'number' ? this.finalAmount : 0;
    const paidAmt = typeof this.amountPaidNow === 'number' ? this.amountPaidNow : 0;
    this.amountDue = Math.max(0, finalAmt - paidAmt);
  }
});

const StudentInvoice =
  mongoose.models.StudentInvoice || mongoose.model('StudentInvoice', studentInvoiceSchema);

module.exports = StudentInvoice;
