const express = require('express');
const { auth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/adminAuth');
const { validate } = require('../middleware/validate');
const { pricingSchema } = require('../utils/validators');
const { upsertPricing, listPricing } = require('../controllers/pricingController');

const router = express.Router();

router.get('/', listPricing);
router.post('/', auth, requireAdmin, validate(pricingSchema), upsertPricing);

module.exports = router;
