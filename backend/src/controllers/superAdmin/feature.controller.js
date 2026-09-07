const { Feature, Plan } = require('../../models');
const { sendSuccess, sendError } = require('../../utils/response');
const { generateFeatureCode } = require('../../utils/idGenerator');

/**
 * @desc    Create a new feature
 * @route   POST /api/super-admin/features
 * @access  Private (Super Admin)
 */
exports.createFeature = async (req, res) => {
  try {
    const { name, description, type, pricing } = req.body;
    let image = null;

    if (req.file) {
      image = req.file.path; // Or just filename depending on your upload logic
    }

    let parsedPricing = pricing;
    if (typeof pricing === 'string') {
      try {
        parsedPricing = JSON.parse(pricing);
      } catch (e) {
        // Fallback or ignore
      }
    }

    const code = await generateFeatureCode();

    const feature = await Feature.create({
      name,
      code,
      description,
      type,
      pricing: parsedPricing,
      image
    });

    return sendSuccess(res, 201, 'Feature created successfully', { feature });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

/**
 * @desc    Get all features with pagination and optional filters
 * @route   GET /api/super-admin/features
 * @access  Private (Super Admin)
 */
exports.getAllFeatures = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.type) query.type = req.query.type;
    if (req.query.isActive !== undefined) query.isActive = req.query.isActive === 'true';

    const features = await Feature.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Feature.countDocuments(query);

    return sendSuccess(res, 200, 'Features fetched successfully', {
      features,
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
 * @desc    Get a single feature by ID
 * @route   GET /api/super-admin/features/:id
 * @access  Private (Super Admin)
 */
exports.getFeatureById = async (req, res) => {
  try {
    const feature = await Feature.findById(req.params.id);
    if (!feature) {
      return sendError(res, 404, 'Feature not found');
    }

    return sendSuccess(res, 200, 'Feature fetched successfully', { feature });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

/**
 * @desc    Update a feature
 * @route   PUT /api/super-admin/features/:id
 * @access  Private (Super Admin)
 */
exports.updateFeature = async (req, res) => {
  try {
    const { name, description, type, pricing } = req.body;
    const updateData = { name, description, type };

    if (pricing) {
      if (typeof pricing === 'string') {
        try {
          updateData.pricing = JSON.parse(pricing);
        } catch (e) {
          // Ignore parse errors if pricing string is invalid JSON
        }
      } else {
        updateData.pricing = pricing;
      }
    }

    if (req.file) {
      updateData.image = req.file.path;
    }

    const feature = await Feature.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!feature) {
      return sendError(res, 404, 'Feature not found');
    }

    return sendSuccess(res, 200, 'Feature updated successfully', { feature });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

/**
 * @desc    Delete a feature
 * @route   DELETE /api/super-admin/features/:id
 * @access  Private (Super Admin)
 */
exports.deleteFeature = async (req, res) => {
  try {
    const featureId = req.params.id;

    // Check if used in any Plan
    const isUsedInPlan = await Plan.exists({ features: featureId });
    if (isUsedInPlan) {
      return sendError(res, 400, 'Cannot delete feature as it is currently used in one or more plans');
    }

    const feature = await Feature.findByIdAndDelete(featureId);
    if (!feature) {
      return sendError(res, 404, 'Feature not found');
    }

    return sendSuccess(res, 200, 'Feature deleted successfully', null);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

/**
 * @desc    Toggle feature status
 * @route   PATCH /api/super-admin/features/:id/toggle-status
 * @access  Private (Super Admin)
 */
exports.toggleFeatureStatus = async (req, res) => {
  try {
    const feature = await Feature.findById(req.params.id);
    if (!feature) {
      return sendError(res, 404, 'Feature not found');
    }

    feature.isActive = !feature.isActive;
    await feature.save();

    return sendSuccess(res, 200, 'Feature status updated successfully', { feature });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};
