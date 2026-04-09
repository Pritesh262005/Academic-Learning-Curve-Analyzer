const express = require('express');
const path = require('path');
const multer = require('multer');
const { body } = require('express-validator');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { uploadAssignment, listAssignments, gradeAssignment } = require('../controllers/assignmentController');
const { createTask, listTasks } = require('../controllers/assignmentTaskController');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', process.env.UPLOADS_DIR || 'uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}_${safe}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 } });

router.use(requireAuth);

router.get('/tasks', requireRole('student', 'faculty', 'admin'), listTasks);

router.post(
  '/tasks',
  requireRole('faculty', 'admin'),
  [
    body('title').isString().trim().isLength({ min: 2 }),
    body('subject').isString().trim().isLength({ min: 2 }),
    body('description').optional().isString().trim(),
    body('dueDate').optional().isISO8601(),
    body('assignedMode').optional().isIn(['all_students', 'students']),
    body('studentIds').optional().isArray(),
  ],
  validate,
  createTask
);

router.get('/', listAssignments);

router.post(
  '/',
  requireRole('student'),
  upload.single('file'),
  [
    body('title').isString().trim().isLength({ min: 2 }),
    body('subject').isString().trim().isLength({ min: 2 }),
    body('description').optional().isString().trim(),
    body('taskId').optional().isMongoId(),
  ],
  validate,
  uploadAssignment
);

router.patch(
  '/:id/grade',
  requireRole('faculty', 'admin'),
  [
    body('marks').isNumeric(),
    body('feedback').optional().isString().trim(),
    body('status').optional().isIn(['graded', 'revision_requested']),
  ],
  validate,
  gradeAssignment
);

module.exports = router;
