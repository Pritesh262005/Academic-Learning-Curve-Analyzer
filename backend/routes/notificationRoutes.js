const express = require('express');
const { body } = require('express-validator');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { listMyNotifications, markRead, sendNotification } = require('../controllers/notificationController');

const router = express.Router();

router.use(requireAuth);

router.get('/', listMyNotifications);
router.patch('/:id/read', markRead);

router.post(
  '/send',
  requireRole('admin', 'faculty'),
  [
    body('targetMode').isIn(['user', 'role', 'all']),
    body('userId').optional().isMongoId(),
    body('role').optional().isIn(['admin', 'faculty', 'student']),
    body('title').isString().trim().isLength({ min: 2 }),
    body('body').optional().isString().trim(),
    body('type').optional().isIn(['info', 'success', 'warning', 'danger']),
  ],
  validate,
  sendNotification
);

module.exports = router;
