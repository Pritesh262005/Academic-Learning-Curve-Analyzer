const express = require('express');
const { body } = require('express-validator');
const { listUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(requireAuth, requireRole('admin'));

router.get('/', listUsers);

router.post(
  '/',
  [
    body('name').isString().trim().isLength({ min: 2 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isString().isLength({ min: 6 }),
    body('role').isIn(['admin', 'faculty', 'student']),
    body('subjects').optional().isArray(),
  ],
  validate,
  createUser
);

router.patch(
  '/:id',
  [
    body('name').optional().isString().trim().isLength({ min: 2 }),
    body('role').optional().isIn(['admin', 'faculty', 'student']),
    body('password').optional().isString().isLength({ min: 6 }),
    body('subjects').optional().isArray(),
  ],
  validate,
  updateUser
);

router.delete('/:id', deleteUser);

module.exports = router;

