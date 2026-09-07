const { Student, Seat, Locker, Book, BookIssue, StudentInvoice } = require('../../models');
const { sendSuccess, sendError } = require('../../utils/response');

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/v1/admin/dashboard/stats
 * @access  Private (Admin)
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const adminId = req.user.id;
    
    const totalStudents = await Student.countDocuments({ adminId });
    const activeStudents = await Student.countDocuments({ adminId, isActive: true });
    
    const totalSeats = await Seat.countDocuments({ adminId });
    const occupiedSeats = await Seat.countDocuments({ adminId, status: 'occupied' });
    
    const totalLockers = await Locker.countDocuments({ adminId });
    const occupiedLockers = await Locker.countDocuments({ adminId, isOccupied: true });
    
    const totalBooks = await Book.countDocuments({ adminId });
    const issuedBooks = await BookIssue.countDocuments({ adminId, status: 'issued' });
    
    // Revenue this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const invoices = await StudentInvoice.find({ 
      adminId, 
      createdAt: { $gte: startOfMonth }
    }).populate('paymentId');
    
    let revenueThisMonth = 0;
    let pendingPayments = 0;
    
    invoices.forEach(inv => {
      if (inv.paymentId && inv.paymentId.status === 'completed') {
        revenueThisMonth += inv.totalAmount;
      } else if (inv.paymentId && inv.paymentId.status === 'pending') {
        pendingPayments += inv.totalAmount;
      }
    });
    
    return sendSuccess(res, 200, 'Dashboard stats retrieved', {
      totalStudents,
      activeStudents,
      totalSeats,
      occupiedSeats,
      totalLockers,
      occupiedLockers,
      totalBooks,
      issuedBooks,
      revenueThisMonth,
      pendingPayments
    });
  } catch (error) {
    return sendError(res, 500, 'Server Error', error.message);
  }
};
