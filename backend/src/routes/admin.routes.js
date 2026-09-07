const router = require('express').Router();
const { authenticate, isAdmin } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const { handleValidationErrors, validateLogin, validateRegister, validateObjectId, validatePagination } = require('../middleware/validate');

// ─── Controller Imports ──────────────────────────────
const authCtrl = require('../controllers/admin/auth.controller');
const studentCtrl = require('../controllers/admin/student.controller');
const seatCtrl = require('../controllers/admin/seat.controller');
const shiftCtrl = require('../controllers/admin/shift.controller');
const lockerCtrl = require('../controllers/admin/locker.controller');
const bookCtrl = require('../controllers/admin/book.controller');
const paymentCtrl = require('../controllers/admin/payment.controller');
const studentPaymentCtrl = require('../controllers/admin/studentPayment.controller');
const planCtrl = require('../controllers/superAdmin/plan.controller');
const dashboardCtrl = require('../controllers/admin/dashboard.controller');

// ─── Auth Routes ─────────────────────────────────────
router.post('/auth/register', validateRegister, handleValidationErrors, authCtrl.register);
router.post('/auth/login', validateLogin, handleValidationErrors, authCtrl.login);
router.post('/auth/google/login', authCtrl.googleLogin);
router.post('/auth/google', authCtrl.googleLogin);
router.get('/auth/profile', authenticate, isAdmin, authCtrl.getProfile);
router.put('/auth/profile', authenticate, isAdmin, uploadSingle, authCtrl.updateProfile);

// ─── Student Routes ─────────────────────────────────
router.post('/student/admit', authenticate, isAdmin, uploadSingle, studentCtrl.admitStudent);
router.get('/student/all', authenticate, isAdmin, studentCtrl.getAllStudents);
router.get('/student/search', authenticate, isAdmin, studentCtrl.searchStudents);
router.get('/student/get/:id', authenticate, isAdmin, studentCtrl.getStudentById);
router.put('/student/update/:id', authenticate, isAdmin, uploadSingle, studentCtrl.updateStudent);
router.delete('/student/delete/:id', authenticate, isAdmin, studentCtrl.deleteStudent);

// ─── Seat Routes ─────────────────────────────────────
router.post('/seat/create', authenticate, isAdmin, seatCtrl.createSeat);
router.post('/seat/bulk', authenticate, isAdmin, seatCtrl.createBulkSeats);
router.get('/seat/all', authenticate, isAdmin, seatCtrl.getAllSeats);
router.get('/seat/available', authenticate, isAdmin, seatCtrl.getAvailableSeats);
router.get('/seat/get/:id', authenticate, isAdmin, seatCtrl.getSeatById);
router.put('/seat/update/:id', authenticate, isAdmin, seatCtrl.updateSeat);
router.delete('/seat/delete/:id', authenticate, isAdmin, seatCtrl.deleteSeat);

// ─── Shift Routes ────────────────────────────────────
router.post('/shift/create', authenticate, isAdmin, shiftCtrl.createShift);
router.get('/shift/all', authenticate, isAdmin, shiftCtrl.getAllShifts);
router.get('/shift/get/:id', authenticate, isAdmin, shiftCtrl.getShiftById);
router.put('/shift/update/:id', authenticate, isAdmin, shiftCtrl.updateShift);
router.delete('/shift/delete/:id', authenticate, isAdmin, shiftCtrl.deleteShift);
router.patch('/shift/toggle/:id', authenticate, isAdmin, shiftCtrl.toggleShiftStatus);

// ─── Locker Routes ───────────────────────────────────
router.post('/locker/create', authenticate, isAdmin, lockerCtrl.createLocker);
router.post('/locker/bulk', authenticate, isAdmin, lockerCtrl.createBulkLockers);
router.get('/locker/all', authenticate, isAdmin, lockerCtrl.getAllLockers);
router.get('/locker/get/:id', authenticate, isAdmin, lockerCtrl.getLockerById);
router.put('/locker/update/:id', authenticate, isAdmin, lockerCtrl.updateLocker);
router.delete('/locker/delete/:id', authenticate, isAdmin, lockerCtrl.deleteLocker);
router.post('/locker/assign', authenticate, isAdmin, lockerCtrl.assignLocker);
router.post('/locker/release', authenticate, isAdmin, lockerCtrl.releaseLocker);

// ─── Book Routes ─────────────────────────────────────
router.post('/book/add', authenticate, isAdmin, uploadSingle, bookCtrl.addBook);
router.get('/book/all', authenticate, isAdmin, bookCtrl.getAllBooks);
router.get('/book/get/:id', authenticate, isAdmin, bookCtrl.getBookById);
router.put('/book/update/:id', authenticate, isAdmin, uploadSingle, bookCtrl.updateBook);
router.delete('/book/delete/:id', authenticate, isAdmin, bookCtrl.deleteBook);
router.post('/book/issue', authenticate, isAdmin, bookCtrl.issueBook);
router.post('/book/return', authenticate, isAdmin, bookCtrl.returnBook);
router.get('/book/issues', authenticate, isAdmin, bookCtrl.getBookIssues);

// ─── Plan Catalog Route (Admin) ──────────────────────
router.get('/plan/all', authenticate, isAdmin, planCtrl.getAllPlans);

// ─── Payment Routes (Razorpay) ──────────────────────
router.post('/payment/create-order', authenticate, isAdmin, paymentCtrl.createSubscriptionOrder);
router.post('/payment/verify-payment', authenticate, isAdmin, paymentCtrl.verifySubscriptionPayment);
router.post('/student-payment/create-order', authenticate, isAdmin, studentPaymentCtrl.createStudentPaymentOrder);
router.post('/student-payment/verify', authenticate, isAdmin, studentPaymentCtrl.verifyStudentPayment);

// ─── Dashboard ───────────────────────────────────────
router.get('/dashboard/stats', authenticate, isAdmin, dashboardCtrl.getDashboardStats);

module.exports = router;
