/**
 * @file constants.js
 * @description Central constants for the Library Sathi project.
 */

module.exports = {
  ROLES: {
    SUPER_ADMIN: 'super-admin',
    ADMIN: 'admin',
    STUDENT: 'student',
  },
  PAYMENT_STATUS: {
    DUE: 'due',
    PARTIAL: 'partial',
    PAID: 'paid',
    ADVANCE: 'advance',
    REFUNDED: 'refunded',
  },
  SUBSCRIPTION_STATUS: {
    CREATED: 'created',
    PENDING: 'pending',
    PAID: 'paid',
    FAILED: 'failed',
    EXPIRED: 'expired',
  },
  SEAT_STATUS: {
    AVAILABLE: 'available',
    OCCUPIED: 'occupied',
    MAINTENANCE: 'maintenance',
    RESERVED: 'reserved',
  },
  LOCKER_STATUS: {
    AVAILABLE: 'available',
    OCCUPIED: 'occupied',
    MAINTENANCE: 'maintenance',
  },
  BOOK_ISSUE_STATUS: {
    ISSUED: 'issued',
    RETURNED: 'returned',
    OVERDUE: 'overdue',
    LOST: 'lost',
  },
  FEATURE_TYPES: {
    BASIC: 'basic',
    PREMIUM: 'premium',
    ADDON: 'addon',
  },
  BILLING_CYCLES: {
    MONTHLY: 'monthly',
    YEARLY: 'yearly',
    LIFETIME: 'lifetime',
  },
  MAX_FILE_SIZE: 2 * 1024 * 1024, // 2MB
  SSO_TTL: 300, // 5 minutes
};
