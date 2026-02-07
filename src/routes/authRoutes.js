const express = require('express');
const { validate } = require('../middleware/validate');
const { otpRequestSchema, otpVerifySchema, registerSchema, loginSchema } = require('../utils/validators');
const {
  requestOtpHandler,
  verifyOtpHandler,
  registerHandler,
  loginHandler,
} = require('../controllers/authController');

const router = express.Router();

router.post('/otp/request', validate(otpRequestSchema), requestOtpHandler);
router.post('/otp/verify', validate(otpVerifySchema), verifyOtpHandler);
router.post('/register', validate(registerSchema), registerHandler);
router.post('/login', validate(loginSchema), loginHandler);

module.exports = router;
