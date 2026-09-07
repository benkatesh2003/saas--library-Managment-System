const { StudentPayment, Student, StudentInvoice } = require('../../models');
const { sendSuccess, sendError } = require('../../utils/response');
const { createOrder, verifyPaymentSignature, fetchOrder } = require('../../utils/razorpayService');

/**
 * @desc    Create Razorpay order for student fee payment
 * @route   POST /api/admin/student-payment/create-order
 * @access  Private (Admin)
 *
 * Body: { paymentId, studentId, amount }
 */
exports.createStudentPaymentOrder = async (req, res) => {
  try {
    const isStudentUser = req.user.role === 'student';
    const adminId = isStudentUser ? req.user.adminId : req.user.id;
    const effectiveStudentId = isStudentUser ? req.user.id : req.body.studentId;
    const { paymentId, amount } = req.body;

    let payment = null;
    if (paymentId) {
      payment = await StudentPayment.findOne({ _id: paymentId, adminId });
    } else if (effectiveStudentId) {
      payment = await StudentPayment.findOne({
        studentId: effectiveStudentId,
        adminId,
        paymentStatus: { $in: ['due', 'partial'] },
      }).sort({ createdAt: -1 });
    }

    if (!payment) {
      return sendError(res, 404, 'No pending payment record found for this student');
    }

    let payAmount = payment.amountDue;
    if (amount !== undefined && amount !== null && Number(amount) > 0) {
      payAmount = Number(amount);
    } else if (payment.amountDue <= 0) {
      return sendError(res, 400, 'Student has no outstanding balance due');
    }

    if (payAmount <= 0) {
      return sendError(res, 400, 'Invalid payment amount');
    }

    const student = await Student.findById(payment.studentId);
    if (!student) {
      return sendError(res, 404, 'Student not found');
    }

    // Receipt ID max 40 chars
    const receipt = `sp_${payment._id.toString().slice(-12)}_${Date.now().toString().slice(-6)}`;
    const order = await createOrder(Math.round(payAmount * 100), 'INR', receipt, {
      adminId: adminId.toString(),
      studentId: student._id.toString(),
      paymentId: payment._id.toString(),
      payAmount: payAmount.toString(),
    });

    payment.razorpayOrderId = order.id;
    await payment.save();

    return sendSuccess(res, 200, 'Razorpay order created for student fee', {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency || 'INR',
      key: process.env.RAZORPAY_KEY_ID,
      paymentId: payment._id,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        studentId: student.studentId,
      },
      amountDue: payment.amountDue,
      amountToPay: payAmount,
    });
  } catch (error) {
    console.error('createStudentPaymentOrder error:', error.message);
    return sendError(res, 500, 'Failed to create student payment order', error.message);
  }
};

/**
 * @desc    Verify Razorpay payment for student fee
 * @route   POST /api/admin/student-payment/verify
 * @access  Private (Admin)
 *
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
exports.verifyStudentPayment = async (req, res) => {
  try {
    const isStudentUser = req.user.role === 'student';
    const adminId = isStudentUser ? req.user.adminId : req.user.id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return sendError(res, 400, 'Missing payment verification fields');
    }

    const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      return sendError(res, 400, 'Invalid payment signature');
    }

    const query = { razorpayOrderId: razorpay_order_id };
    if (adminId) query.adminId = adminId;
    if (isStudentUser) query.studentId = req.user.id;

    const payment = await StudentPayment.findOne(query);

    if (!payment) {
      return sendError(res, 404, 'Student payment order not found');
    }

    // Determine amount paid from Razorpay order or fallback
    let paidAmount = payment.amountDue;
    try {
      const order = await fetchOrder(razorpay_order_id);
      if (order && order.amount) {
        paidAmount = order.amount / 100;
      }
    } catch (e) {
      console.warn('Could not fetch order amount from Razorpay, using current amountDue fallback:', e.message);
    }

    payment.amountPaid = (payment.amountPaid || 0) + paidAmount;
    if (payment.finalAmount < payment.amountPaid) {
      payment.finalAmount = payment.amountPaid;
      payment.totalAmount = Math.max(payment.totalAmount || 0, payment.amountPaid);
    }
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.paymentMethod = 'razorpay';
    payment.paymentDate = new Date();

    // Pre-save hook will recalculate amountDue and paymentStatus
    await payment.save();

    // Sync status to the Student document
    const student = await Student.findById(payment.studentId);
    if (student) {
      student.paymentStatus = payment.paymentStatus;
      await student.save();
    }

    // Update invoice if exists
    try {
      const invoice = await StudentInvoice.findOne({ paymentId: payment._id, adminId });
      if (invoice) {
        invoice.amountPaidNow = (invoice.amountPaidNow || 0) + paidAmount;
        invoice.amountDue = Math.max(0, invoice.finalAmount - invoice.amountPaidNow);
        invoice.paymentMethod = 'razorpay';
        await invoice.save();
      }
    } catch (invErr) {
      console.warn('Failed to update invoice on student payment:', invErr.message);
    }

    return sendSuccess(res, 200, 'Student payment verified successfully', {
      payment,
      student: student ? {
        id: student._id,
        name: student.name,
        paymentStatus: student.paymentStatus,
      } : null,
    });
  } catch (error) {
    console.error('verifyStudentPayment error:', error.message);
    return sendError(res, 500, 'Student payment verification failed', error.message);
  }
};
