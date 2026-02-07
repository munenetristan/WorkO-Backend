const express = require('express');
const multer = require('multer');
const path = require('path');
const { auth, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { providerLocationSchema } = require('../utils/validators');
const {
  setOnlineStatus,
  updateLocation,
  uploadDocument,
  acceptJob,
  rejectJob,
  cancelJob,
  startJob,
  completeJob,
} = require('../controllers/providerController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});

const upload = multer({ storage });

router.use(auth, requireRole(['PROVIDER']));

router.patch('/online', setOnlineStatus);
router.patch('/location', validate(providerLocationSchema), updateLocation);
router.post('/documents', upload.single('file'), uploadDocument);
router.post('/documents/upload', upload.single('file'), uploadDocument);
router.post('/jobs/:jobId/accept', acceptJob);
router.post('/jobs/:jobId/reject', rejectJob);
router.post('/jobs/:jobId/cancel', cancelJob);
router.post('/jobs/:jobId/start', startJob);
router.post('/jobs/:jobId/complete', completeJob);

module.exports = router;
