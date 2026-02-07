const mongoose = require('mongoose');
const { AdminRoles } = require('../utils/constants');

const adminUserSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    role: { type: String, enum: Object.values(AdminRoles), required: true },
    permissions: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdminUser', adminUserSchema);
