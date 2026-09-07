const { Seat } = require('../../models');
const { sendSuccess, sendError } = require('../../utils/response');

/**
 * @desc    Create new seat
 * @route   POST /api/v1/admin/seats
 * @access  Private (Admin)
 */
exports.createSeat = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { seatNumber, floor, section } = req.body;
    
    const existing = await Seat.findOne({ adminId, seatNumber });
    if (existing) return sendError(res, 400, 'Seat number already exists');
    
    const seat = new Seat({ adminId, seatNumber, floor, section });
    await seat.save();
    
    return sendSuccess(res, 201, 'Seat created', { seat });
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Create bulk seats
 * @route   POST /api/v1/admin/seats/bulk
 * @access  Private (Admin)
 */
exports.createBulkSeats = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { prefix, start, end, floor, section } = req.body;
    
    const seats = [];
    for (let i = start; i <= end; i++) {
      const seatNumber = `${prefix}-${i}`;
      const existing = await Seat.findOne({ adminId, seatNumber });
      if (!existing) {
        seats.push({ adminId, seatNumber, floor, section });
      }
    }
    
    if (seats.length > 0) {
      await Seat.insertMany(seats);
    }
    
    return sendSuccess(res, 201, `${seats.length} seats created successfully`);
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Get all seats
 * @route   GET /api/v1/admin/seats
 * @access  Private (Admin)
 */
exports.getAllSeats = async (req, res) => {
  try {
    const { status, floor } = req.query;
    const query = { adminId: req.user.id };
    
    if (status) query.status = status;
    if (floor) query.floor = floor;
    
    const seats = await Seat.find(query).populate('reservedFor', 'firstName lastName studentId');
    return sendSuccess(res, 200, 'Seats retrieved', { seats });
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Get seat by ID
 * @route   GET /api/v1/admin/seats/:id
 * @access  Private (Admin)
 */
exports.getSeatById = async (req, res) => {
  try {
    const seat = await Seat.findOne({ _id: req.params.id, adminId: req.user.id }).populate('reservedFor', 'firstName lastName studentId');
    if (!seat) return sendError(res, 404, 'Seat not found');
    return sendSuccess(res, 200, 'Seat retrieved', { seat });
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Update seat
 * @route   PUT /api/v1/admin/seats/:id
 * @access  Private (Admin)
 */
exports.updateSeat = async (req, res) => {
  try {
    const { seatNumber, floor, section, status } = req.body;
    const seat = await Seat.findOneAndUpdate(
      { _id: req.params.id, adminId: req.user.id },
      { seatNumber, floor, section, status },
      { new: true, runValidators: true }
    );
    
    if (!seat) return sendError(res, 404, 'Seat not found');
    return sendSuccess(res, 200, 'Seat updated', { seat });
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Delete seat
 * @route   DELETE /api/v1/admin/seats/:id
 * @access  Private (Admin)
 */
exports.deleteSeat = async (req, res) => {
  try {
    const seat = await Seat.findOne({ _id: req.params.id, adminId: req.user.id });
    if (!seat) return sendError(res, 404, 'Seat not found');
    
    if (seat.status === 'occupied' || seat.reservedFor) {
      return sendError(res, 400, 'Cannot delete an occupied seat');
    }
    
    await seat.deleteOne();
    return sendSuccess(res, 200, 'Seat deleted');
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Get available seats
 * @route   GET /api/v1/admin/seats/available
 * @access  Private (Admin)
 */
exports.getAvailableSeats = async (req, res) => {
  try {
    const seats = await Seat.find({ adminId: req.user.id, status: 'available' });
    return sendSuccess(res, 200, 'Available seats retrieved', { seats });
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};
