const express = require('express');
const { auth } = require('../middleware/auth');
const { requireAdmin, requireAdminRole } = require('../middleware/adminAuth');
const { validate } = require('../middleware/validate');
const { adminLoginSchema, adminCreateSchema } = require('../utils/validators');
const {
  approveProvider,
  rejectProvider,
  banProvider,
  suspendProvider,
  listProviders,
  adminLogin,
  createAdmin,
} = require('../controllers/adminController');

const router = express.Router();

router.post('/login', validate(adminLoginSchema), adminLogin);
router.post('/create', auth, requireAdmin, requireAdminRole(['SUPER_ADMIN']), validate(adminCreateSchema), createAdmin);
router.get('/providers', auth, requireAdmin, listProviders);
router.post('/providers/:id/approve', auth, requireAdmin, approveProvider);
router.post('/providers/:id/reject', auth, requireAdmin, rejectProvider);
router.post('/providers/:id/ban', auth, requireAdmin, banProvider);
router.post('/providers/:id/suspend', auth, requireAdmin, suspendProvider);

module.exports = router;
