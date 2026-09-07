const { Subscription, Admin, Plan } = require('../../models');
const crypto = require('crypto');
// Assuming a razorpay util exists, or using razorpay SDK directly
// const Razorpay = require('razorpay');
const { sendSuccess, sendError } = require('../../utils/response');

/**
 * @desc    Create subscription order
 * @route   POST /api/v1/admin/payment/order
 * @access  Private (Admin)
 */
exports.createSubscriptionOrder = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { planId, customFeatures = [] } = req.body;
    
    const plan = await Plan.findById(planId);
    if (!plan) return sendError(res, 404, 'Plan not found');
    
    let amount = plan.price;
    // Calculate custom features cost if necessary
    
    // Razorpay Integration Stub
    // const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    // const options = { amount: amount * 100, currency: 'INR', receipt: `rcpt_${adminId}` };
    // const order = await razorpay.orders.create(options);
    
    // Fake order for now
    const order = { id: `order_${crypto.randomBytes(8).toString('hex')}`, amount: amount * 100 };
    
    const subscription = new Subscription({
      adminId,
      planId,
      amount,
      status: 'created',
      paymentId: order.id // mapping razorpay order id here temporarily
    });
    
    await subscription.save();
    
    return sendSuccess(res, 200, 'Order created', { 
      orderId: order.id, 
      amount: order.amount, 
      key: process.env.RAZORPAY_KEY_ID 
    });
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Verify subscription payment
 * @route   POST /api/v1/admin/payment/verify
 * @access  Private (Admin)
 */
exports.verifySubscriptionPayment = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');
      
    if (expectedSignature !== razorpay_signature) {
      return sendError(res, 400, 'Invalid payment signature');
    }
    
    const subscription = await Subscription.findOne({ adminId, paymentId: razorpay_order_id, status: 'created' });
    if (!subscription) return sendError(res, 404, 'Subscription order not found');
    
    subscription.status = 'paid';
    subscription.isActive = true;
    subscription.startDate = new Date();
    
    // Calculate end date based on plan duration
    const plan = await Plan.findById(subscription.planId);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (plan.durationInDays || 30));
    subscription.endDate = endDate;
    
    await subscription.save();
    
    const admin = await Admin.findById(adminId);
    admin.subscriptionId = subscription._id;
    admin.activeFeatures = plan.features; // simplistic assignment
    await admin.save();
    
    return sendSuccess(res, 200, 'Payment verified successfully', { subscription });
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};
