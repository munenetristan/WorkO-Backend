const bcrypt = require('bcryptjs');
const ProviderProfile = require('../models/ProviderProfile');
const User = require('../models/User');
const AdminUser = require('../models/AdminUser');
const { createAccessToken } = require('../utils/token');

const approveProvider = async (req, res, next) => {
  try {
    const profile = await ProviderProfile.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: 'APPROVED' },
      { new: true }
    );
    if (!profile) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }
    return res.status(200).json(profile);
  } catch (error) {
    return next(error);
  }
};

const rejectProvider = async (req, res, next) => {
  try {
    const profile = await ProviderProfile.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: 'REJECTED' },
      { new: true }
    );
    if (!profile) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }
    return res.status(200).json(profile);
  } catch (error) {
    return next(error);
  }
};

const banProvider = async (req, res, next) => {
  try {
    const profile = await ProviderProfile.findByIdAndUpdate(
      req.params.id,
      { isBanned: true, isOnline: false },
      { new: true }
    );
    if (!profile) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }
    return res.status(200).json(profile);
  } catch (error) {
    return next(error);
  }
};

const suspendProvider = async (req, res, next) => {
  try {
    const { hours } = req.body;
    const suspendUntil = new Date(Date.now() + (hours || 12) * 60 * 60 * 1000);
    const profile = await ProviderProfile.findByIdAndUpdate(
      req.params.id,
      { suspendedUntil: suspendUntil },
      { new: true }
    );
    if (!profile) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }
    return res.status(200).json(profile);
  } catch (error) {
    return next(error);
  }
};

const listProviders = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.status) {
      query.verificationStatus = req.query.status.toUpperCase();
    }
    const providers = await ProviderProfile.find(query).populate('userId');
    return res.status(200).json(providers);
  } catch (error) {
    return next(error);
  }
};

const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const admin = await AdminUser.findOne({ userId: user._id });
    if (!admin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = createAccessToken(user);
    return res.status(200).json({ token, admin, user });
  } catch (error) {
    return next(error);
  }
};

const createAdmin = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, password, role, country } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      passwordHash,
      role: 'CUSTOMER',
      country,
    });
    const adminUser = await AdminUser.create({
      userId: user._id,
      role,
      permissions: [],
    });
    return res.status(201).json({ adminUser, user });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  approveProvider,
  rejectProvider,
  banProvider,
  suspendProvider,
  listProviders,
  adminLogin,
  createAdmin,
};
