const express = require('express');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { pricingSchema } = require('../utils/validators');
const { upsertPricing, listPricing } = require('../controllers/pricingController');

const router = express.Router();

router.get('/', listPricing);
router.post('/', auth, validate(pricingSchema), upsertPricing);

module.exports = router;
