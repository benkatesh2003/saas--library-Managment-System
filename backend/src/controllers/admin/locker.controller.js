const { Locker } = require('../../models');
const { sendSuccess, sendError } = require('../../utils/response');

/**
 * @desc    Create locker
 * @route   POST /api/v1/admin/lockers
 * @access  Private (Admin)
 */
exports.createLocker = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { lockerNumber, price, status } = req.body;
    
    const existing = await Locker.findOne({ adminId, lockerNumber });
    if (existing) return sendError(res, 400, 'Locker number already exists');
    
    const locker = new Locker({ adminId, lockerNumber, price, status });
    await locker.save();
    
    return sendSuccess(res, 201, 'Locker created', { locker });
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Create bulk lockers
 * @route   POST /api/v1/admin/lockers/bulk
 * @access  Private (Admin)
 */
exports.createBulkLockers = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { prefix, start, end, price } = req.body;
    
    const lockers = [];
    for (let i = start; i <= end; i++) {
      const lockerNumber = `${prefix}-${i}`;
      const existing = await Locker.findOne({ adminId, lockerNumber });
      if (!existing) {
        lockers.push({ adminId, lockerNumber, price });
      }
    }
    
    if (lockers.length > 0) {
      await Locker.insertMany(lockers);
    }
    
    return sendSuccess(res, 201, `${lockers.length} lockers created successfully`);
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Get all lockers
 * @route   GET /api/v1/admin/lockers
 * @access  Private (Admin)
 */
exports.getAllLockers = async (req, res) => {
  try {
    const { status, isOccupied } = req.query;
    const query = { adminId: req.user.id };
    
    if (status) query.status = status;
    if (isOccupied !== undefined) query.isOccupied = isOccupied === 'true';
    
    const lockers = await Locker.find(query).populate('studentId', 'firstName lastName studentId');
    return sendSuccess(res, 200, 'Lockers retrieved', { lockers });
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Get locker by ID
 * @route   GET /api/v1/admin/lockers/:id
 * @access  Private (Admin)
 */
exports.getLockerById = async (req, res) => {
  try {
    const locker = await Locker.findOne({ _id: req.params.id, adminId: req.user.id }).populate('studentId', 'firstName lastName studentId');
    if (!locker) return sendError(res, 404, 'Locker not found');
    return sendSuccess(res, 200, 'Locker retrieved', { locker });
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Update locker
 * @route   PUT /api/v1/admin/lockers/:id
 * @access  Private (Admin)
 */
exports.updateLocker = async (req, res) => {
  try {
    const { lockerNumber, price, status } = req.body;
    const locker = await Locker.findOneAndUpdate(
      { _id: req.params.id, adminId: req.user.id },
      { lockerNumber, price, status },
      { new: true, runValidators: true }
    );
    
    if (!locker) return sendError(res, 404, 'Locker not found');
    return sendSuccess(res, 200, 'Locker updated', { locker });
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Delete locker
 * @route   DELETE /api/v1/admin/lockers/:id
 * @access  Private (Admin)
 */
exports.deleteLocker = async (req, res) => {
  try {
    const locker = await Locker.findOne({ _id: req.params.id, adminId: req.user.id });
    if (!locker) return sendError(res, 404, 'Locker not found');
    
    if (locker.isOccupied || locker.studentId) {
      return sendError(res, 400, 'Cannot delete an occupied locker');
    }
    
    await locker.deleteOne();
    return sendSuccess(res, 200, 'Locker deleted');
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Assign locker
 * @route   POST /api/v1/admin/lockers/:id/assign
 * @access  Private (Admin)
 */
exports.assignLocker = async (req, res) => {
  try {
    const { studentId } = req.body;
    const locker = await Locker.findOne({ _id: req.params.id, adminId: req.user.id });
    
    if (!locker) return sendError(res, 404, 'Locker not found');
    if (locker.isOccupied) return sendError(res, 400, 'Locker already occupied');
    
    locker.isOccupied = true;
    locker.status = 'occupied';
    locker.studentId = studentId;
    await locker.save();
    
    return sendSuccess(res, 200, 'Locker assigned', { locker });
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Release locker
 * @route   POST /api/v1/admin/lockers/:id/release
 * @access  Private (Admin)
 */
exports.releaseLocker = async (req, res) => {
  try {
    const locker = await Locker.findOne({ _id: req.params.id, adminId: req.user.id });
    
    if (!locker) return sendError(res, 404, 'Locker not found');
    if (!locker.isOccupied) return sendError(res, 400, 'Locker is already available');
    
    locker.isOccupied = false;
    locker.status = 'available';
    locker.studentId = null;
    await locker.save();
    
    return sendSuccess(res, 200, 'Locker released', { locker });
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};
