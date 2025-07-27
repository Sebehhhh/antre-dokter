const express = require('express');
const { getSettings, updateSettings } = require('../controllers/adminController');
const { getRecentActivities, getActivityStats } = require('../controllers/activityController');
const { getAllPatients, getPatientDetail, updatePatientStatus, getPatientStats } = require('../controllers/patientController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Activity routes
router.get('/activities', getRecentActivities);
router.get('/activities/stats', getActivityStats);

// Patient management routes
router.get('/patients', getAllPatients);
router.get('/patients/stats', getPatientStats);
router.get('/patients/:patientId', getPatientDetail);
router.put('/patients/:patientId/status', updatePatientStatus);

module.exports = router;