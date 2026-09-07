const router = require('express').Router();
const studentAuthCtrl = require('../controllers/student/auth.controller');
const studentPaymentCtrl = require('../controllers/admin/studentPayment.controller');
const { authenticate, isStudent } = require('../middleware/auth');

// Auth
router.post('/login', studentAuthCtrl.login);

// Protected routes
router.use(authenticate, isStudent);
router.get('/profile', studentAuthCtrl.getProfile);
router.get('/payments', studentAuthCtrl.getPaymentHistory);
router.get('/invoices', studentAuthCtrl.getInvoices);
router.post('/payment/create-order', studentPaymentCtrl.createStudentPaymentOrder);
router.post('/payment/verify', studentPaymentCtrl.verifyStudentPayment);

module.exports = router;
