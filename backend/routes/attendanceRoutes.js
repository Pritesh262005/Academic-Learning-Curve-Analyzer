const express = require('express');
const { body } = require('express-validator');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { markAttendance, getAttendance, getMyAttendance } = require('../controllers/attendanceController');

const router = express.Router();

router.use(requireAuth);

router.get('/me', requireRole('student'), getMyAttendance);
router.get('/:studentId', requireRole('admin', 'faculty'), getAttendance);

router.post(
  '/:studentId',
  requireRole('admin', 'faculty'),
  [body('date').optional().isISO8601(), body('status').isIn(['present', 'absent', 'late'])],
  validate,
  markAttendance
);

module.exports = router;

