const express = require('express');
const {
  getAvailableSlots,
  bookQueue,
  getMyQueues,
  getCurrentQueue,
  cancelQueue,
  callNextQueue,
  completeQueue,
  updateQueueStatus,
  getQueuesByDate,
  bookQueueForPatient,
  getReportsByDateRange
} = require('../controllers/queueController');
const { validateQueueBooking } = require('../middleware/validation');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/available-slots', getAvailableSlots);
router.get('/current', getCurrentQueue);

// Patient routes
router.get('/my-queues', authenticate, getMyQueues);
router.post('/book', authenticate, authorize('patient'), validateQueueBooking, bookQueue);
router.patch('/cancel/:queueId', authenticate, authorize('patient'), cancelQueue);

// Admin routes for queue management
router.post('/call-next', authenticate, authorize('admin'), callNextQueue);
router.patch('/complete/:queueId', authenticate, authorize('admin'), completeQueue);
router.patch('/update-status/:queueId', authenticate, authorize('admin'), updateQueueStatus);
router.get('/by-date', authenticate, authorize('admin'), getQueuesByDate);
router.get('/reports', authenticate, authorize('admin'), getReportsByDateRange);
router.post('/admin-book', authenticate, authorize('admin'), bookQueueForPatient);

module.exports = router;