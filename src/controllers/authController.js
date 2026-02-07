const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');
const CustomerProfile = require('../models/CustomerProfile');
const Country = require('../models/Country');
const { requestOtp, verifyOtp } = require('../services/otpService');
const { createAccessToken, createOtpToken, verifyOtpToken } = require('../utils/token');

const requestOtpHandler = async (req, res, next) => {
  try {
    const { phone, countryCode, dialingCode } = req.body;
    const country = await Country.findOne({ iso2: countryCode.toUpperCase(), enabled: true });
    if (!country || country.dialingCode !== dialingCode) {
      return res.status(400).json({ message: 'Unsupported country selection' });
    }
    const { code, expiresAt } = await requestOtp(phone);
    return res.status(200).json({ message: 'OTP sent', expiresAt, otpPreview: code });
  } catch (error) {
    return next(error);
  }
};

const verifyOtpHandler = async (req, res, next) => {
  try {
    const { phone, code } = req.body;
    const isValid = await verifyOtp(phone, code);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    const user = await User.findOne({ phone });
    if (!user) {
      const otpToken = createOtpToken(phone);
      return res.status(200).json({ needsRegistration: true, otpToken });
    }
    const token = createAccessToken(user);
    return res.status(200).json({ token, user });
  } catch (error) {
    return next(error);
  }
};

const registerHandler = async (req, res, next) => {
  try {
    const payload = verifyOtpToken(req.body.otpToken);
    const phone = payload.phone;

    const country = await Country.findOne({ iso2: req.body.country.toUpperCase(), enabled: true });
    if (!country) {
      return res.status(400).json({ message: 'Invalid country' });
    }

    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone,
      email: req.body.email,
      passwordHash,
      role: req.body.role,
      country: req.body.country,
    });

    if (req.body.role === 'PROVIDER') {
      await ProviderProfile.create({
        userId: user._id,
        gender: req.body.gender,
        dob: req.body.dob,
        nationalityType: req.body.nationalityType,
        idOrPassportNumber: req.body.idOrPassportNumber,
        servicesOffered: req.body.servicesOffered,
      });
    } else {
      await CustomerProfile.create({
        userId: user._id,
      });
    }

    const token = createAccessToken(user);
    return res.status(201).json({ token, user });
  } catch (error) {
    return next(error);
  }
};

const loginHandler = async (req, res, next) => {
  try {
    const { phone, email, password } = req.body;
    const query = phone ? { phone } : { email };
    const user = await User.findOne(query);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = createAccessToken(user);
    return res.status(200).json({ token, user });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  requestOtpHandler,
  verifyOtpHandler,
  registerHandler,
  loginHandler,
};
