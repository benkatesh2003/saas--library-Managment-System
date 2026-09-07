/**
 * @file studentPayment.model.js
 * @description Mongoose model for Student Payments in the Library Sathi multi-tenant SaaS platform.
 * Manages student fee payments, shift and locker charges, discounts, partial/full settlements,
 * Razorpay transaction details, billing coverage periods, and automated status calculations.
 */

const mongoose = require('mongoose');

/**
 * Student Payment Schema
 *
 * @typedef {Object} StudentPayment
 * @property {mongoose.Types.ObjectId} _id - Unique auto-generated document identifier.
 * @property {mongoose.Types.ObjectId} studentId - Reference to the Student.
 * @property {mongoose.Types.ObjectId} adminId - Reference to the Admin (tenant owner).
 * @property {number} shiftAmount - Fee amount allocated for shift / seat slot.
 * @property {number} lockerAmount - Fee amount allocated for locker facility.
 * @property {number} additionalCharges - Extra fees (e.g. maintenance, registration, ID card).
 * @property {number} totalAmount - Gross total amount before applying discount.
 * @property {number} totalDiscount - Total discount amount applied to the payment.
 * @property {number} finalAmount - Net payable amount (totalAmount - totalDiscount).
 * @property {number} amountPaid - Total amount paid by the student so far.
 * @property {number} amountDue - Remaining unpaid balance (finalAmount - amountPaid).
 * @property {'cash'|'upi'|'card'|'bank_transfer'|'razorpay'|'other'} paymentMethod - Mode of payment used.
 * @property {'due'|'partial'|'paid'|'advance'|'refunded'} paymentStatus - Current settlement status.
 * @property {string|null} razorpayOrderId - Razorpay Order ID for online gateway payments.
 * @property {string|null} razorpayPaymentId - Razorpay Payment ID on successful transaction.
 * @property {string|null} razorpaySignature - Razorpay cryptographic signature for verification.
 * @property {Date|null} paymentDate - Timestamp when the payment transaction occurred.
 * @property {Date} periodStart - Start date of the subscription / service coverage period.
 * @property {Date} periodEnd - End date of the subscription / service coverage period.
 * @property {string} notes - Additional notes or remarks regarding the payment.
 * @property {Date} createdAt - Timestamp when record was created.
 * @property {Date} updatedAt - Timestamp when record was last updated.
 * @property {boolean} isFullyPaid - Virtual getter indicating if payment is fully cleared.
 * @property {boolean} isOverdue - Virtual getter indicating if unpaid balance is past periodEnd.
 * @property {number} balanceDue - Virtual getter returning non-negative due balance.
 */
const studentPaymentSchema = new mongoose.Schema(
  {
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
    shiftAmount: {
      type: Number,
      default: 0,
      min: [0, 'Shift amount cannot be negative'],
    },
    lockerAmount: {
      type: Number,
      default: 0,
      min: [0, 'Locker amount cannot be negative'],
    },
    additionalCharges: {
      type: Number,
      default: 0,
      min: [0, 'Additional charges cannot be negative'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    totalDiscount: {
      type: Number,
      default: 0,
      min: [0, 'Total discount cannot be negative'],
    },
    finalAmount: {
      type: Number,
      required: [true, 'Final amount is required'],
      min: [0, 'Final amount cannot be negative'],
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: [0, 'Amount paid cannot be negative'],
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
    paymentStatus: {
      type: String,
      enum: {
        values: ['due', 'partial', 'paid', 'advance', 'refunded'],
        message: '{VALUE} is not a valid payment status (due, partial, paid, advance, refunded)',
      },
      default: 'due',
    },
    razorpayOrderId: {
      type: String,
      trim: true,
      default: null,
    },
    razorpayPaymentId: {
      type: String,
      trim: true,
      default: null,
    },
    razorpaySignature: {
      type: String,
      trim: true,
      default: null,
    },
    paymentDate: {
      type: Date,
      default: null,
    },
    periodStart: {
      type: Date,
      required: [true, 'Period start date is required'],
    },
    periodEnd: {
      type: Date,
      required: [true, 'Period end date is required'],
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
// Query student payments by tenant and student
studentPaymentSchema.index({ adminId: 1, studentId: 1 });

// Query payments by tenant and payment status (e.g., finding all 'due' or 'partial')
studentPaymentSchema.index({ adminId: 1, paymentStatus: 1 });

// Query payments by tenant and payment date for financial reporting
studentPaymentSchema.index({ adminId: 1, paymentDate: 1 });

// Query payments by coverage period range for active membership checks
studentPaymentSchema.index({ adminId: 1, periodStart: 1, periodEnd: 1 });

// ---------------------------------------------------------------------------
// Virtuals
// ---------------------------------------------------------------------------
/**
 * Virtual: isFullyPaid
 * Returns true if the amount paid is greater than or equal to finalAmount.
 *
 * @returns {boolean}
 */
studentPaymentSchema.virtual('isFullyPaid').get(function () {
  return typeof this.amountPaid === 'number' && typeof this.finalAmount === 'number'
    ? this.amountPaid >= this.finalAmount
    : false;
});

/**
 * Virtual: isOverdue
 * Returns true if payment has an outstanding due balance and the periodEnd has passed.
 *
 * @returns {boolean}
 */
studentPaymentSchema.virtual('isOverdue').get(function () {
  if (this.paymentStatus === 'paid' || this.paymentStatus === 'advance') {
    return false;
  }
  if (!this.periodEnd) {
    return false;
  }
  return new Date() > new Date(this.periodEnd);
});

/**
 * Virtual: balanceDue
 * Returns the non-negative remaining balance due.
 *
 * @returns {number}
 */
studentPaymentSchema.virtual('balanceDue').get(function () {
  const finalAmt = typeof this.finalAmount === 'number' ? this.finalAmount : 0;
  const paidAmt = typeof this.amountPaid === 'number' ? this.amountPaid : 0;
  return Math.max(0, finalAmt - paidAmt);
});

// ---------------------------------------------------------------------------
// Pre-Save Middleware Hook
// ---------------------------------------------------------------------------
/**
 * Pre-save hook:
 * 1. Calculates `amountDue = Math.max(0, finalAmount - amountPaid)`.
 * 2. Sets `paymentDate` to current timestamp if payment was made and date is unset.
 * 3. Auto-determines `paymentStatus` ('due', 'partial', 'paid', 'advance') based on amounts,
 *    unless explicitly set to 'refunded'.
 */
studentPaymentSchema.pre('save', function () {
  const finalAmt = typeof this.finalAmount === 'number' ? this.finalAmount : 0;
  const paidAmt = typeof this.amountPaid === 'number' ? this.amountPaid : 0;

  // 1. Calculate amountDue
  this.amountDue = Math.max(0, finalAmt - paidAmt);

  // 2. Default paymentDate if money was paid and paymentDate not set
  if (paidAmt > 0 && !this.paymentDate) {
    this.paymentDate = new Date();
  }

  // 3. Auto-set paymentStatus based on amounts (preserve 'refunded' if explicitly set)
  if (this.paymentStatus !== 'refunded') {
    if (paidAmt <= 0) {
      this.paymentStatus = 'due';
    } else if (paidAmt < finalAmt) {
      this.paymentStatus = 'partial';
    } else if (paidAmt === finalAmt) {
      this.paymentStatus = 'paid';
    } else {
      // paidAmt > finalAmt
      this.paymentStatus = 'advance';
    }
  }
});

// ---------------------------------------------------------------------------
// Static Methods
// ---------------------------------------------------------------------------
/**
 * Retrieves total revenue summary for a tenant admin within an optional date range.
 *
 * @param {mongoose.Types.ObjectId|string} adminId - Tenant admin ID.
 * @param {Date} [startDate] - Start date filter for paymentDate.
 * @param {Date} [endDate] - End date filter for paymentDate.
 * @returns {Promise<Object>} Aggregated financial metrics.
 */
studentPaymentSchema.statics.getRevenueSummary = async function (adminId, startDate, endDate) {
  const matchQuery = {
    adminId: new mongoose.Types.ObjectId(adminId),
  };

  if (startDate || endDate) {
    matchQuery.paymentDate = {};
    if (startDate) matchQuery.paymentDate.$gte = new Date(startDate);
    if (endDate) matchQuery.paymentDate.$lte = new Date(endDate);
  }

  const result = await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amountPaid' },
        totalDue: { $sum: '$amountDue' },
        totalDiscounts: { $sum: '$totalDiscount' },
        paymentCount: { $sum: 1 },
      },
    },
  ]);

  return result[0] || { totalRevenue: 0, totalDue: 0, totalDiscounts: 0, paymentCount: 0 };
};

const StudentPayment =
  mongoose.models.StudentPayment || mongoose.model('StudentPayment', studentPaymentSchema);

module.exports = StudentPayment;
