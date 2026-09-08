const router = require('express').Router();
const { authenticate, isSuperAdmin } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const { handleValidationErrors, validateLogin, validateSuperAdminRegister, validateObjectId } = require('../middleware/validate');

// ─── Controller Imports ──────────────────────────────
const authCtrl = require('../controllers/superAdmin/auth.controller');
const featureCtrl = require('../controllers/superAdmin/feature.controller');
const planCtrl = require('../controllers/superAdmin/plan.controller');
const subCtrl = require('../controllers/superAdmin/subscription.controller');
const demoCtrl = require('../controllers/superAdmin/demoRequest.controller');

// ─── Auth Routes ─────────────────────────────────────
router.post('/auth/register', validateSuperAdminRegister, handleValidationErrors, authCtrl.register);
router.post('/auth/login', validateLogin, handleValidationErrors, authCtrl.login);
router.get('/auth/profile', authenticate, isSuperAdmin, authCtrl.getProfile);

// ─── Demo Request / Leads Routes (Public Submission + Admin Management) ──
router.post('/demo-request/create', demoCtrl.createDemoRequest);
router.get('/demo-request/all', authenticate, isSuperAdmin, demoCtrl.getAllDemoRequests);
router.patch('/demo-request/status/:id', authenticate, isSuperAdmin, demoCtrl.updateDemoRequestStatus);
router.delete('/demo-request/delete/:id', authenticate, isSuperAdmin, demoCtrl.deleteDemoRequest);

// ─── Feature Routes ─────────────────────────────────
router.post('/feature/create', authenticate, isSuperAdmin, uploadSingle, featureCtrl.createFeature);
router.get('/feature/all', authenticate, isSuperAdmin, featureCtrl.getAllFeatures);
router.get('/feature/get/:id', authenticate, isSuperAdmin, featureCtrl.getFeatureById);
router.put('/feature/update/:id', authenticate, isSuperAdmin, uploadSingle, featureCtrl.updateFeature);
router.delete('/feature/delete/:id', authenticate, isSuperAdmin, featureCtrl.deleteFeature);
router.patch('/feature/toggle/:id', authenticate, isSuperAdmin, featureCtrl.toggleFeatureStatus);

// ─── Plan Routes ─────────────────────────────────────
router.post('/plan/create', authenticate, isSuperAdmin, planCtrl.createPlan);
router.get('/plan/all', authenticate, isSuperAdmin, planCtrl.getAllPlans);
router.get('/plan/get/:id', authenticate, isSuperAdmin, planCtrl.getPlanById);
router.put('/plan/update/:id', authenticate, isSuperAdmin, planCtrl.updatePlan);
router.delete('/plan/delete/:id', authenticate, isSuperAdmin, planCtrl.deletePlan);
router.patch('/plan/toggle/:id', authenticate, isSuperAdmin, planCtrl.togglePlanStatus);

// ─── Subscription Routes ────────────────────────────
router.get('/subscription/all', authenticate, isSuperAdmin, subCtrl.getAllSubscriptions);
router.get('/subscription/get/:id', authenticate, isSuperAdmin, subCtrl.getSubscriptionById);
router.get('/subscription/admin/:id', authenticate, isSuperAdmin, subCtrl.getSubscriptionsByAdmin);
router.patch('/subscription/status/:id', authenticate, isSuperAdmin, subCtrl.updateSubscriptionStatus);

module.exports = router;
