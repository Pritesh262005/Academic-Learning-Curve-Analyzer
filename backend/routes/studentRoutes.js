const express = require('express');
const { body } = require('express-validator');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const {
  getMyStudentDoc,
  listStudents,
  addMarks,
  getStudentMarks,
  getMyMarks,
} = require('../controllers/studentController');

const router = express.Router();

router.use(requireAuth);

router.get('/me', requireRole('student'), getMyStudentDoc);
router.get('/me/marks', requireRole('student'), getMyMarks);

router.get('/', requireRole('admin', 'faculty'), listStudents);
router.get('/:studentId/marks', requireRole('admin', 'faculty'), getStudentMarks);

router.post(
  '/:studentId/marks',
  requireRole('faculty', 'admin'),
  [
    body('subject').isString().trim().isLength({ min: 2 }),
    body('assessment').optional().isString().trim().isLength({ min: 2 }),
    body('score').isNumeric(),
    body('maxScore').isNumeric(),
    body('date').optional().isISO8601(),
  ],
  validate,
  addMarks
);

module.exports = router;

