const AdminUser = require('../models/AdminUser');

const requireAdmin = async (req, res, next) => {
  const admin = await AdminUser.findOne({ userId: req.user._id });
  if (!admin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  req.admin = admin;
  return next();
};

const requireAdminRole = (roles) => (req, res, next) => {
  if (!req.admin || !roles.includes(req.admin.role)) {
    return res.status(403).json({ message: 'Admin role required' });
  }
  return next();
};

module.exports = { requireAdmin, requireAdminRole };
