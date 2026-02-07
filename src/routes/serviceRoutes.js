const express = require('express');
const { auth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/adminAuth');
const { validate } = require('../middleware/validate');
const { serviceCreateSchema, serviceCountrySchema } = require('../utils/validators');
const {
  listServices,
  createService,
  updateService,
  deleteService,
  setServiceCountryStatus,
} = require('../controllers/serviceController');

const router = express.Router();

router.get('/', listServices);
router.post('/', auth, requireAdmin, validate(serviceCreateSchema), createService);
router.patch('/:id', auth, requireAdmin, updateService);
router.delete('/:id', auth, requireAdmin, deleteService);
router.post('/:id/country', auth, requireAdmin, validate(serviceCountrySchema), setServiceCountryStatus);

module.exports = router;
