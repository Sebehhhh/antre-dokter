const express = require('express');
const { getSettings, updateSettings } = require('../controllers/adminController');
const { getRecentActivities, getActivityStats } = require('../controllers/activityController');
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

module.exports = router;