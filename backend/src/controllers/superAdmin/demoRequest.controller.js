/**
 * @file demoRequest.controller.js
 * @description Controller for Inbound Demo & Pricing Inquiries.
 */

const { DemoRequest } = require('../../models');
const { sendSuccess, sendError } = require('../../utils/response');

/**
 * @desc    Submit a new demo or pricing inquiry (Public from Landing Page)
 * @route   POST /api/super-admin/demo-request/create
 * @access  Public
 */
exports.createDemoRequest = async (req, res) => {
  try {
    const { name, phone, email, libraryName, city, seatCount, preferredTime, selectedPlan, notes } = req.body;

    if (!name || !phone || !libraryName || !city) {
      return sendError(res, 400, 'Name, phone, library name, and city are required fields.');
    }

    const demoRequest = await DemoRequest.create({
      name: name.trim(),
      phone: phone.trim(),
      email: (email || '').trim(),
      libraryName: libraryName.trim(),
      city: city.trim(),
      seatCount: (seatCount || '50-100').trim(),
      preferredTime: preferredTime || 'morning',
      selectedPlan: (selectedPlan || 'General Demo').trim(),
      notes: (notes || '').trim(),
      status: 'pending',
    });

    return sendSuccess(res, 201, 'Demo request submitted successfully. Our team will contact you shortly.', {
      demoRequest,
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

/**
 * @desc    Get all demo requests with filtering & summary counts
 * @route   GET /api/super-admin/demo-request/all
 * @access  Private (SuperAdmin)
 */
exports.getAllDemoRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { name: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
        { libraryName: searchRegex },
        { city: searchRegex },
        { selectedPlan: searchRegex },
      ];
    }

    const [demoRequests, total, pendingCount, contactedCount, convertedCount] = await Promise.all([
      DemoRequest.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      DemoRequest.countDocuments(query),
      DemoRequest.countDocuments({ status: 'pending' }),
      DemoRequest.countDocuments({ status: 'contacted' }),
      DemoRequest.countDocuments({ status: 'converted' }),
    ]);

    return sendSuccess(res, 200, 'Demo requests retrieved successfully', {
      demoRequests,
      counts: {
        total,
        pending: pendingCount,
        contacted: contactedCount,
        converted: convertedCount,
      },
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

/**
 * @desc    Update demo request status or internal notes
 * @route   PATCH /api/super-admin/demo-request/status/:id
 * @access  Private (SuperAdmin)
 */
exports.updateDemoRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const updateFields = {};
    if (status) updateFields.status = status;
    if (notes !== undefined) updateFields.notes = notes;

    const demoRequest = await DemoRequest.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });

    if (!demoRequest) {
      return sendError(res, 404, 'Demo request not found');
    }

    return sendSuccess(res, 200, 'Demo request updated successfully', { demoRequest });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

/**
 * @desc    Delete a demo request record
 * @route   DELETE /api/super-admin/demo-request/delete/:id
 * @access  Private (SuperAdmin)
 */
exports.deleteDemoRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const demoRequest = await DemoRequest.findByIdAndDelete(id);

    if (!demoRequest) {
      return sendError(res, 404, 'Demo request not found');
    }

    return sendSuccess(res, 200, 'Demo request deleted successfully');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};
