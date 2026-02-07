const express = require('express');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { serviceCreateSchema } = require('../utils/validators');
const {
  listServices,
  createService,
  updateService,
  deleteService,
} = require('../controllers/serviceController');

const router = express.Router();

router.get('/', listServices);
router.post('/', auth, validate(serviceCreateSchema), createService);
router.patch('/:id', auth, updateService);
router.delete('/:id', auth, deleteService);

module.exports = router;
