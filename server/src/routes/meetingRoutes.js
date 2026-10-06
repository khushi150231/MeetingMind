const express = require('express');
const router = express.Router();
const {
  createMeeting,
  getAllMeetings,
  getSingleMeeting,
  updateMeeting,
  deleteMeeting,
  updateActionItemStatus,
  getDashboardStats
} = require('../controllers/meetingController');
const { analyzeMeetingById } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// All meeting routes require authentication
router.use(protect);

router.route('/')
  .post(createMeeting)
  .get(getAllMeetings);

router.get('/stats/dashboard', getDashboardStats);

router.route('/:id')
  .get(getSingleMeeting)
  .put(updateMeeting)
  .delete(deleteMeeting);

router.post('/:id/analyze', analyzeMeetingById);
router.patch('/:id/action-items/:itemId', updateActionItemStatus);

module.exports = router;
