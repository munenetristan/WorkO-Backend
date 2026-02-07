const express = require('express');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { countrySchema } = require('../utils/validators');
const { requireAdmin } = require('../middleware/adminAuth');
const {
  listCountries,
  createCountry,
  updateCountry,
  deleteCountry,
} = require('../controllers/countryController');

const router = express.Router();

router.get('/', listCountries);
router.post('/', auth, requireAdmin, validate(countrySchema), createCountry);
router.patch('/:id', auth, requireAdmin, updateCountry);
router.delete('/:id', auth, requireAdmin, deleteCountry);

module.exports = router;
