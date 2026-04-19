const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/authorize');
const { classAverage, topperList, weakStudents, mySuggestions, subjectCurveAnalyzer } = require('../controllers/analyticsController');

const router = express.Router();

router.use(requireAuth);

router.get('/class-average', requireRole('admin', 'faculty'), classAverage);
router.get('/topper', requireRole('admin', 'faculty'), topperList);
router.get('/weak-students', requireRole('admin', 'faculty'), weakStudents);
router.get('/subject-curve', requireRole('admin', 'faculty'), subjectCurveAnalyzer);
router.get('/me/suggestions', requireRole('student'), mySuggestions);

module.exports = router;

