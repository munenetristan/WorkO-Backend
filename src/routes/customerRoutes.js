const express = require('express');
const { auth, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { jobRequestSchema, messageSchema, ratingSchema } = require('../utils/validators');
const {
  requestJob,
  cancelJob,
  jobStatus,
  trackProvider,
  sendMessage,
  listMessages,
  rateUser,
} = require('../controllers/customerController');

const router = express.Router();

router.use(auth, requireRole(['CUSTOMER']));

router.post('/jobs', validate(jobRequestSchema), requestJob);
router.post('/jobs/:jobId/cancel', cancelJob);
router.get('/jobs/:jobId', jobStatus);
router.get('/jobs/:jobId/track', trackProvider);
router.post('/messages', validate(messageSchema), sendMessage);
router.get('/messages/:jobId', listMessages);
router.post('/ratings', validate(ratingSchema), rateUser);

module.exports = router;
