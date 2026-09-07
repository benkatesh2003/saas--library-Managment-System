const { Subscription, Admin, Plan } = require('../../models');
const { sendSuccess, sendError } = require('../../utils/response');
const { createOrder, verifyPaymentSignature } = require('../../utils/razorpayService');

/**
 * @desc    Create subscription order via Razorpay
 * @route   POST /api/admin/payment/create-order
 * @access  Private (Admin)
 *
 * Body: { planId, billingCycle: 'monthly'|'yearly'|'lifetime' }
 */
exports.createSubscriptionOrder = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { planId, billingCycle = 'monthly' } = req.body;

    if (!planId) return sendError(res, 400, 'Plan ID is required');

    const plan = await Plan.findById(planId);
    if (!plan) return sendError(res, 404, 'Plan not found');
    if (!plan.isActive) return sendError(res, 400, 'This plan is no longer available');

    // Resolve price from pricing sub-document
    const validCycles = ['monthly', 'yearly', 'lifetime'];
    if (!validCycles.includes(billingCycle)) {
      return sendError(res, 400, `Invalid billing cycle. Must be one of: ${validCycles.join(', ')}`);
    }

    let amount = plan.pricing[billingCycle];
    if (amount === undefined || amount === null) {
      return sendError(res, 400, `No pricing available for ${billingCycle} billing cycle`);
    }

    // Apply discount if valid
    let discount = 0;
    if (plan.isDiscountValid && plan.discount?.percentage > 0) {
      discount = Math.round(amount * plan.discount.percentage / 100);
      amount = amount - discount;
    }

    const finalAmount = Math.max(0, amount);

    if (finalAmount <= 0) {
      return sendError(res, 400, 'Plan amount cannot be zero');
    }

    // Create real Razorpay order (amount in paise)
    const receipt = `sub_${adminId}_${Date.now()}`;
    const order = await createOrder(finalAmount * 100, 'INR', receipt, {
      adminId: adminId.toString(),
      planId: planId.toString(),
      billingCycle
    });

    // Create Subscription record
    const subscription = new Subscription({
      adminId,
      planId,
      billingCycle,
      totalAmount: plan.pricing[billingCycle],
      discount,
      finalAmount,
      razorpayOrderId: order.id,
      paymentStatus: 'created'
    });

    await subscription.save();

    return sendSuccess(res, 200, 'Razorpay order created', {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency || 'INR',
      key: process.env.RAZORPAY_KEY_ID,
      planName: plan.name,
      billingCycle
    });
  } catch (error) {
    console.error('createSubscriptionOrder error:', error.message);
    return sendError(res, 500, 'Failed to create payment order', error.message);
  }
};

/**
 * @desc    Verify subscription payment signature from Razorpay
 * @route   POST /api/admin/payment/verify-payment
 * @access  Private (Admin)
 *
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
exports.verifySubscriptionPayment = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return sendError(res, 400, 'Missing payment verification fields');
    }

    // Verify signature using shared utility
    const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      return sendError(res, 400, 'Invalid payment signature');
    }

    // Find the subscription by Razorpay order ID
    const subscription = await Subscription.findOne({
      adminId,
      razorpayOrderId: razorpay_order_id,
      paymentStatus: 'created'
    });
    if (!subscription) return sendError(res, 404, 'Subscription order not found');

    // Update with payment details
    subscription.razorpayPaymentId = razorpay_payment_id;
    subscription.razorpaySignature = razorpay_signature;
    subscription.paymentStatus = 'paid'; // triggers pre-save hook: isActive = true
    subscription.startDate = new Date();

    // Calculate end date based on billing cycle
    const plan = await Plan.findById(subscription.planId);
    const endDate = new Date();
    if (subscription.billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else if (subscription.billingCycle === 'lifetime') {
      endDate.setFullYear(endDate.getFullYear() + 100);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }
    subscription.endDate = endDate;

    await subscription.save();

    // Link subscription to admin
    const admin = await Admin.findById(adminId);
    if (admin) {
      admin.subscriptionId = subscription._id;
      if (plan && plan.features) {
        admin.activeFeatures = plan.features;
      }
      await admin.save();
    }

    return sendSuccess(res, 200, 'Payment verified successfully', { subscription });
  } catch (error) {
    console.error('verifySubscriptionPayment error:', error.message);
    return sendError(res, 500, 'Payment verification failed', error.message);
  }
};
