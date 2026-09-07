const router = require('express').Router();

const superAdminRoutes = require('./superAdmin.routes');
const adminRoutes = require('./admin.routes');
const studentRoutes = require('./student.routes');

router.use('/super-admin', superAdminRoutes);
router.use('/admin', adminRoutes);
router.use('/student', studentRoutes);

module.exports = router;
