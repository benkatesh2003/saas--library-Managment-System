const { Subscription } = require('../../models');
const { sendSuccess, sendError } = require('../../utils/response');

/**
 * @desc    Get all subscriptions
 * @route   GET /api/super-admin/subscriptions
 * @access  Private (Super Admin)
 */
exports.getAllSubscriptions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.paymentStatus) query.paymentStatus = req.query.paymentStatus;

    const subscriptions = await Subscription.find(query)
      .populate('adminId', 'libraryName email')
      .populate('planId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Subscription.countDocuments(query);

    return sendSuccess(res, 200, 'Subscriptions fetched successfully', {
      subscriptions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

/**
 * @desc    Get a single subscription by ID
 * @route   GET /api/super-admin/subscriptions/:id
 * @access  Private (Super Admin)
 */
exports.getSubscriptionById = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate('adminId', 'libraryName email')
      .populate('planId', 'name');

    if (!subscription) {
      return sendError(res, 404, 'Subscription not found');
    }

    return sendSuccess(res, 200, 'Subscription fetched successfully', { subscription });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

/**
 * @desc    Get subscriptions for a specific admin
 * @route   GET /api/super-admin/subscriptions/admin/:adminId
 * @access  Private (Super Admin)
 */
exports.getSubscriptionsByAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    
    const subscriptions = await Subscription.find({ adminId })
      .populate('planId', 'name')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Subscriptions fetched successfully', { subscriptions });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

/**
 * @desc    Manually update subscription payment status
 * @route   PATCH /api/super-admin/subscriptions/:id/status
 * @access  Private (Super Admin)
 */
exports.updateSubscriptionStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    
    if (!paymentStatus) {
      return sendError(res, 400, 'Payment status is required');
    }

    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true, runValidators: true }
    );

    if (!subscription) {
      return sendError(res, 404, 'Subscription not found');
    }

    return sendSuccess(res, 200, 'Subscription status updated successfully', { subscription });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};
