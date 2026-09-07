const { Plan, Feature, Subscription } = require('../../models');
const { sendSuccess, sendError } = require('../../utils/response');

/**
 * @desc    Create a new plan
 * @route   POST /api/super-admin/plans
 * @access  Private (Super Admin)
 */
exports.createPlan = async (req, res) => {
  try {
    const { name, description, features, pricing, discount, maxStudents, maxSeats } = req.body;

    // Validate feature IDs
    if (features && features.length > 0) {
      const validFeaturesCount = await Feature.countDocuments({ _id: { $in: features } });
      if (validFeaturesCount !== features.length) {
        return sendError(res, 400, 'One or more invalid feature IDs provided');
      }
    }

    const plan = await Plan.create({
      name,
      description,
      features,
      pricing,
      discount,
      maxStudents,
      maxSeats
    });

    return sendSuccess(res, 201, 'Plan created successfully', { plan });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

/**
 * @desc    Get all plans
 * @route   GET /api/super-admin/plans
 * @access  Private (Super Admin)
 */
exports.getAllPlans = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.isActive !== undefined) query.isActive = req.query.isActive === 'true';

    const plans = await Plan.find(query)
      .populate('features')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Plan.countDocuments(query);

    return sendSuccess(res, 200, 'Plans fetched successfully', {
      plans,
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
 * @desc    Get a single plan by ID
 * @route   GET /api/super-admin/plans/:id
 * @access  Private (Super Admin)
 */
exports.getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id).populate('features');
    if (!plan) {
      return sendError(res, 404, 'Plan not found');
    }

    return sendSuccess(res, 200, 'Plan fetched successfully', { plan });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

/**
 * @desc    Update a plan
 * @route   PUT /api/super-admin/plans/:id
 * @access  Private (Super Admin)
 */
exports.updatePlan = async (req, res) => {
  try {
    const { name, description, features, pricing, discount, maxStudents, maxSeats } = req.body;

    if (features && features.length > 0) {
      const validFeaturesCount = await Feature.countDocuments({ _id: { $in: features } });
      if (validFeaturesCount !== features.length) {
        return sendError(res, 400, 'One or more invalid feature IDs provided');
      }
    }

    const plan = await Plan.findByIdAndUpdate(
      req.params.id,
      { name, description, features, pricing, discount, maxStudents, maxSeats },
      { new: true, runValidators: true }
    ).populate('features');

    if (!plan) {
      return sendError(res, 404, 'Plan not found');
    }

    return sendSuccess(res, 200, 'Plan updated successfully', { plan });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

/**
 * @desc    Delete a plan
 * @route   DELETE /api/super-admin/plans/:id
 * @access  Private (Super Admin)
 */
exports.deletePlan = async (req, res) => {
  try {
    const planId = req.params.id;

    // Check if used in any active Subscription
    const isUsedInSubscription = await Subscription.exists({ planId, status: 'ACTIVE' });
    if (isUsedInSubscription) {
      return sendError(res, 400, 'Cannot delete plan as it is currently used by active subscriptions');
    }

    const plan = await Plan.findByIdAndDelete(planId);
    if (!plan) {
      return sendError(res, 404, 'Plan not found');
    }

    return sendSuccess(res, 200, 'Plan deleted successfully', null);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

/**
 * @desc    Toggle plan status
 * @route   PATCH /api/super-admin/plans/:id/toggle-status
 * @access  Private (Super Admin)
 */
exports.togglePlanStatus = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return sendError(res, 404, 'Plan not found');
    }

    plan.isActive = !plan.isActive;
    await plan.save();

    return sendSuccess(res, 200, 'Plan status updated successfully', { plan });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};
