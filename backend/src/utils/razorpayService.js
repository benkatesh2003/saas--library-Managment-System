/**
 * @file razorpayService.js
 * @description Razorpay payment helpers for creating orders and verifying signatures.
 */

const Razorpay = require('razorpay');
const crypto = require('crypto');

const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

/**
 * Creates a Razorpay instance.
 * @returns {Razorpay} Razorpay instance.
 */
const createRazorpayInstance = () => {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay keys are missing from environment variables');
  }
  return new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
};

/**
 * Creates a new order in Razorpay.
 * @param {number} amount - Amount in smallest currency unit (e.g., paise for INR).
 * @param {string} currency - Currency code (e.g., 'INR').
 * @param {string} receipt - Receipt identifier.
 * @param {Object} [notes={}] - Additional notes.
 * @returns {Promise<Object>} The created Razorpay order.
 */
const createOrder = async (amount, currency, receipt, notes = {}) => {
  try {
    const razorpay = createRazorpayInstance();
    const options = {
      amount,
      currency,
      receipt,
      notes,
    };
    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    throw new Error(`Razorpay order creation failed: ${error.message}`);
  }
};

/**
 * Verifies the payment signature returned by Razorpay.
 * @param {string} orderId - The Razorpay order ID.
 * @param {string} paymentId - The Razorpay payment ID.
 * @param {string} signature - The signature to verify.
 * @returns {boolean} True if signature is valid, false otherwise.
 */
const verifyPaymentSignature = (orderId, paymentId, signature) => {
  try {
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
      
    return expectedSignature === signature;
  } catch (error) {
    return false;
  }
};

/**
 * Fetches an order from Razorpay by orderId.
 * @param {string} orderId
 * @returns {Promise<Object>}
 */
const fetchOrder = async (orderId) => {
  try {
    const razorpay = createRazorpayInstance();
    return await razorpay.orders.fetch(orderId);
  } catch (error) {
    throw new Error(`Razorpay fetch order failed: ${error.message}`);
  }
};

module.exports = {
  createRazorpayInstance,
  createOrder,
  fetchOrder,
  verifyPaymentSignature,
};
