const { Student, Seat, Locker, Shift, StudentPayment, StudentInvoice } = require('../../models');
const { sendSuccess, sendError } = require('../../utils/response');
const { generateStudentId } = require('../../utils/idGenerator');
const crypto = require('crypto');

/**
 * @desc    Admit new student
 * @route   POST /api/admin/student/admit
 * @access  Private (Admin)
 *
 * Expected body:
 * {
 *   name, email, phone, address,
 *   seatId, shiftId, lockerId,
 *   startDate, endDate, duration,
 *   discount, paymentStatus
 * }
 */
exports.admitStudent = async (req, res) => {
  try {
    const adminId = req.user.id;
    const {
      name, email, phone, address,
      seatId, shiftId, lockerId,
      startDate, endDate, duration = 1,
      discount = 0, paymentStatus = 'due'
    } = req.body;

    // ─── Validations ────────────────────────────────
    if (!name) return sendError(res, 400, 'Student name is required');
    if (!startDate || !endDate) return sendError(res, 400, 'Subscription startDate and endDate are required');

    // ─── Duplicate Detection ────────────────────────
    if (phone) {
      const existingByPhone = await Student.findOne({ adminId, phone, isActive: true });
      if (existingByPhone) {
        return sendError(res, 409, `A student with this phone number already exists (${existingByPhone.studentId}: ${existingByPhone.name})`);
      }
    }
    if (email) {
      const existingByEmail = await Student.findOne({ adminId, email: email.toLowerCase(), isActive: true });
      if (existingByEmail) {
        return sendError(res, 409, `A student with this email already exists (${existingByEmail.studentId}: ${existingByEmail.name})`);
      }
    }

    // ─── Generate ID & Password ─────────────────────
    const studentIdStr = await generateStudentId(adminId);
    const password = crypto.randomBytes(4).toString('hex'); // 8-char temp password

    // ─── Handle Image Upload ────────────────────────
    let image = { url: null, publicId: null };
    if (req.file) {
      image.url = req.file.path;
    }

    // ─── Lookup Seat, Shift, Locker ─────────────────
    let seat = null, shift = null, locker = null;
    let fees = 0;

    if (shiftId) {
      shift = await Shift.findOne({ _id: shiftId, adminId });
      if (!shift) return sendError(res, 404, 'Shift not found');
      if (shift.maxStudents > 0 && shift.currentStudents >= shift.maxStudents) {
        return sendError(res, 400, `Shift '${shift.name}' is full (${shift.currentStudents}/${shift.maxStudents} students)`);
      }
      fees += shift.price || 0;
    }

    if (lockerId) {
      locker = await Locker.findOne({ _id: lockerId, adminId, isOccupied: false });
      if (!locker) return sendError(res, 400, 'Locker not available');
      fees += locker.price || 0;
    }

    if (seatId) {
      seat = await Seat.findOne({ _id: seatId, adminId, status: 'available' });
      if (!seat) return sendError(res, 400, 'Seat not available');
    }

    // ─── Calculate Final Amount ─────────────────────
    const totalAmount = fees;
    const finalAmount = Math.max(0, totalAmount - discount);

    // ─── Create Student (matching model schema) ─────
    const student = new Student({
      adminId,
      studentId: studentIdStr,
      name,
      email: email || null,
      phone: phone || null,
      password,
      address: address || null,
      image,

      seat: {
        seatId: seat ? seat._id : null,
        seatNumber: seat ? seat.seatNumber : null
      },

      shift: {
        shiftId: shift ? shift._id : null,
        shiftName: shift ? shift.name : null
      },

      locker: {
        lockerId: locker ? locker._id : null,
        lockerNumber: locker ? locker.lockerNumber : null
      },

      subscription: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        duration
      },

      paymentStatus
    });

    await student.save();

    // ─── Update Seat Status ─────────────────────────
    if (seat) {
      seat.status = 'occupied';
      seat.reservedFor = student._id;
      await seat.save();
    }

    // ─── Update Locker Status ───────────────────────
    if (locker) {
      locker.status = 'occupied';
      locker.isOccupied = true;
      locker.studentId = student._id;
      await locker.save();
    }

    // ─── Update Shift Count ─────────────────────────
    if (shift) {
      shift.currentStudents = (shift.currentStudents || 0) + 1;
      await shift.save();
    }

    // ─── Create Payment Record ──────────────────────
    const payment = new StudentPayment({
      adminId,
      studentId: student._id,
      shiftAmount: shift ? (shift.price || 0) : 0,
      lockerAmount: locker ? (locker.price || 0) : 0,
      totalAmount,
      totalDiscount: discount,
      finalAmount,
      amountPaid: 0,
      amountDue: finalAmount,
      paymentStatus: paymentStatus,
      periodStart: new Date(startDate),
      periodEnd: new Date(endDate)
    });
    await payment.save();

    // ─── Create Invoice ─────────────────────────────
    const lineItems = [];
    if (shift) lineItems.push({ description: `Shift: ${shift.name}`, amount: shift.price || 0 });
    if (locker) lineItems.push({ description: `Locker: ${locker.lockerNumber}`, amount: locker.price || 0 });

    const invoice = new StudentInvoice({
      adminId,
      studentId: student._id,
      paymentId: payment._id,
      lineItems,
      totalPayable: totalAmount,
      discount,
      finalAmount,
      amountPaidNow: 0,
      amountDue: finalAmount
    });
    await invoice.save();

    return sendSuccess(res, 201, 'Student admitted successfully', {
      student,
      payment,
      invoice,
      tempPassword: password
    });
  } catch (error) {
    console.error('admitStudent error:', error.stack);
    return sendError(res, 500, 'Server Error', error.stack || error.message);
  }
};

/**
 * @desc    Get all students
 * @route   GET /api/admin/student/all
 * @access  Private (Admin)
 */
exports.getAllStudents = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { page = 1, limit = 10, search, isActive, paymentStatus, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query = { adminId };

    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (paymentStatus) query.paymentStatus = paymentStatus;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const students = await Student.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Student.countDocuments(query);

    return sendSuccess(res, 200, 'Students retrieved', {
      students,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Get student by ID
 * @route   GET /api/admin/student/get/:id
 * @access  Private (Admin)
 */
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findOne({ _id: req.params.id, adminId: req.user.id });

    if (!student) return sendError(res, 404, 'Student not found');

    return sendSuccess(res, 200, 'Student retrieved', { student });
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Update student
 * @route   PUT /api/admin/student/update/:id
 * @access  Private (Admin)
 */
exports.updateStudent = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { id } = req.params;
    const updates = req.body;

    const student = await Student.findOne({ _id: id, adminId });
    if (!student) return sendError(res, 404, 'Student not found');

    // ─── Handle Seat Reassignment ─────────────────
    if (updates.seatId && updates.seatId !== student.seat?.seatId?.toString()) {
      // Release old seat
      if (student.seat?.seatId) {
        await Seat.findByIdAndUpdate(student.seat.seatId, { status: 'available', reservedFor: null });
      }
      // Assign new seat
      const newSeat = await Seat.findOne({ _id: updates.seatId, adminId, status: 'available' });
      if (!newSeat) return sendError(res, 400, 'New seat not available');
      newSeat.status = 'occupied';
      newSeat.reservedFor = student._id;
      await newSeat.save();
      student.seat = { seatId: newSeat._id, seatNumber: newSeat.seatNumber };
      delete updates.seatId;
    }

    // ─── Handle Locker Reassignment ───────────────
    if (updates.lockerId && updates.lockerId !== student.locker?.lockerId?.toString()) {
      if (student.locker?.lockerId) {
        await Locker.findByIdAndUpdate(student.locker.lockerId, { status: 'available', isOccupied: false, studentId: null });
      }
      const newLocker = await Locker.findOne({ _id: updates.lockerId, adminId, isOccupied: false });
      if (!newLocker) return sendError(res, 400, 'New locker not available');
      newLocker.status = 'occupied';
      newLocker.isOccupied = true;
      newLocker.studentId = student._id;
      await newLocker.save();
      student.locker = { lockerId: newLocker._id, lockerNumber: newLocker.lockerNumber };
      delete updates.lockerId;
    }

    // ─── Handle Shift Reassignment ────────────────
    if (updates.shiftId && updates.shiftId !== student.shift?.shiftId?.toString()) {
      if (student.shift?.shiftId) {
        await Shift.findByIdAndUpdate(student.shift.shiftId, { $inc: { currentStudents: -1 } });
      }
      const newShift = await Shift.findOne({ _id: updates.shiftId, adminId });
      if (!newShift) return sendError(res, 404, 'New shift not found');
      newShift.currentStudents = (newShift.currentStudents || 0) + 1;
      await newShift.save();
      student.shift = { shiftId: newShift._id, shiftName: newShift.name };
      delete updates.shiftId;
    }

    // ─── Apply remaining simple field updates ─────
    const allowedFields = ['name', 'email', 'phone', 'address', 'paymentStatus', 'isActive'];
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        student[field] = updates[field];
      }
    }

    // ─── Handle subscription update ───────────────
    if (updates.startDate || updates.endDate || updates.duration) {
      student.subscription = {
        startDate: updates.startDate ? new Date(updates.startDate) : student.subscription.startDate,
        endDate: updates.endDate ? new Date(updates.endDate) : student.subscription.endDate,
        duration: updates.duration || student.subscription.duration
      };
    }

    // ─── Handle image update ──────────────────────
    if (req.file) {
      student.image = { url: req.file.path, publicId: null };
    }

    await student.save();

    return sendSuccess(res, 200, 'Student updated', { student });
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Delete student (Soft delete)
 * @route   DELETE /api/admin/student/delete/:id
 * @access  Private (Admin)
 */
exports.deleteStudent = async (req, res) => {
  try {
    const adminId = req.user.id;
    const student = await Student.findOne({ _id: req.params.id, adminId });

    if (!student) return sendError(res, 404, 'Student not found');

    student.isActive = false;
    await student.save();

    // Release resources
    if (student.seat?.seatId) {
      await Seat.findByIdAndUpdate(student.seat.seatId, { status: 'available', reservedFor: null });
    }
    if (student.locker?.lockerId) {
      await Locker.findByIdAndUpdate(student.locker.lockerId, { status: 'available', isOccupied: false, studentId: null });
    }
    if (student.shift?.shiftId) {
      await Shift.findByIdAndUpdate(student.shift.shiftId, { $inc: { currentStudents: -1 } });
    }

    return sendSuccess(res, 200, 'Student deactivated and resources released');
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Search students
 * @route   GET /api/admin/student/search
 * @access  Private (Admin)
 */
exports.searchStudents = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return sendError(res, 400, 'Search query required');

    const students = await Student.find({
      adminId: req.user.id,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { studentId: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } }
      ]
    }).limit(20);

    return sendSuccess(res, 200, 'Search results', { students });
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};
