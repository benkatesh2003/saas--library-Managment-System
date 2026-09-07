const { Shift } = require('../../models');
const { sendSuccess, sendError } = require('../../utils/response');

/**
 * @desc    Create new shift
 * @route   POST /api/v1/admin/shifts
 * @access  Private (Admin)
 */
exports.createShift = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { name, startTime, endTime, price, description, maxStudents } = req.body;
    
    const shift = new Shift({
      adminId, name, startTime, endTime, price, description,
      ...(maxStudents !== undefined && { maxStudents })
    });
    
    await shift.save();
    return sendSuccess(res, 201, 'Shift created', { shift });
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Get all shifts
 * @route   GET /api/v1/admin/shifts
 * @access  Private (Admin)
 */
exports.getAllShifts = async (req, res) => {
  try {
    const shifts = await Shift.find({ adminId: req.user.id });
    return sendSuccess(res, 200, 'Shifts retrieved', { shifts });
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Get shift by ID
 * @route   GET /api/v1/admin/shifts/:id
 * @access  Private (Admin)
 */
exports.getShiftById = async (req, res) => {
  try {
    const shift = await Shift.findOne({ _id: req.params.id, adminId: req.user.id });
    if (!shift) return sendError(res, 404, 'Shift not found');
    return sendSuccess(res, 200, 'Shift retrieved', { shift });
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Update shift
 * @route   PUT /api/v1/admin/shifts/:id
 * @access  Private (Admin)
 */
exports.updateShift = async (req, res) => {
  try {
    const { name, startTime, endTime, price, description } = req.body;
    const shift = await Shift.findOneAndUpdate(
      { _id: req.params.id, adminId: req.user.id },
      { name, startTime, endTime, price, description },
      { new: true, runValidators: true }
    );
    
    if (!shift) return sendError(res, 404, 'Shift not found');
    return sendSuccess(res, 200, 'Shift updated', { shift });
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Delete shift
 * @route   DELETE /api/v1/admin/shifts/:id
 * @access  Private (Admin)
 */
exports.deleteShift = async (req, res) => {
  try {
    const shift = await Shift.findOne({ _id: req.params.id, adminId: req.user.id });
    if (!shift) return sendError(res, 404, 'Shift not found');
    
    if (shift.currentStudents > 0) {
      return sendError(res, 400, 'Cannot delete shift with enrolled students');
    }
    
    await shift.deleteOne();
    return sendSuccess(res, 200, 'Shift deleted');
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Toggle shift status
 * @route   PATCH /api/v1/admin/shifts/:id/status
 * @access  Private (Admin)
 */
exports.toggleShiftStatus = async (req, res) => {
  try {
    const shift = await Shift.findOne({ _id: req.params.id, adminId: req.user.id });
    if (!shift) return sendError(res, 404, 'Shift not found');
    
    shift.isActive = !shift.isActive;
    await shift.save();
    
    return sendSuccess(res, 200, `Shift status updated to ${shift.isActive ? 'active' : 'inactive'}`, { shift });
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};
