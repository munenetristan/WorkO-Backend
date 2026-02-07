const express = require('express');
const { auth, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { jobRequestSchema } = require('../utils/validators');
const {
  requestJob,
  payJob,
  acceptJob,
  rejectJob,
  cancelJob,
  startJob,
  completeJob,
} = require('../controllers/jobController');

const router = express.Router();

router.post('/request', auth, requireRole(['CUSTOMER']), validate(jobRequestSchema), requestJob);
router.post('/:id/pay', auth, requireRole(['CUSTOMER']), payJob);
router.post('/:id/accept', auth, requireRole(['PROVIDER']), acceptJob);
router.post('/:id/reject', auth, requireRole(['PROVIDER']), rejectJob);
router.post('/:id/cancel', auth, cancelJob);
router.post('/:id/start', auth, requireRole(['PROVIDER']), startJob);
router.post('/:id/complete', auth, requireRole(['PROVIDER']), completeJob);

module.exports = router;
