const express = require('express');
const {
  createEmergencyClosure,
  getEmergencyClosures,
  checkEmergencyClosure,
  rescheduleAffectedQueues,
  deactivateEmergencyClosure
} = require('../controllers/emergencyController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Admin only routes
router.post('/closure', authenticate, authorize('admin'), createEmergencyClosure);
router.get('/closures', authenticate, authorize('admin'), getEmergencyClosures);
router.post('/reschedule', authenticate, authorize('admin'), rescheduleAffectedQueues);
router.patch('/closure/:emergencyClosureId/deactivate', authenticate, authorize('admin'), deactivateEmergencyClosure);

// Public route to check emergency closure
router.get('/check-closure', checkEmergencyClosure);

module.exports = router;