const express = require('express');
const {
  getPatientNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} = require('../controllers/notificationController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Patient notification routes
router.get('/', authenticate, authorize('patient'), getPatientNotifications);
router.patch('/:notificationId/read', authenticate, authorize('patient'), markNotificationAsRead);
router.patch('/mark-all-read', authenticate, authorize('patient'), markAllNotificationsAsRead);

module.exports = router;