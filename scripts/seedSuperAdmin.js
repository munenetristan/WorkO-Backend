require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const AdminUser = require('../src/models/AdminUser');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const email = process.env.SUPER_ADMIN_EMAIL || 'superadmin@worko.com';
  const password = process.env.SUPER_ADMIN_PASSWORD || 'ChangeMe123!';
  const phone = process.env.SUPER_ADMIN_PHONE || '+10000000000';
  const country = process.env.SUPER_ADMIN_COUNTRY || 'US';

  const existing = await User.findOne({ email });
  if (existing) {
    const admin = await AdminUser.findOne({ userId: existing._id });
    if (!admin) {
      await AdminUser.create({ userId: existing._id, role: 'SUPER_ADMIN', permissions: ['*'] });
    }
    await mongoose.disconnect();
    console.log('Super admin already exists');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    firstName: 'Super',
    lastName: 'Admin',
    email,
    phone,
    passwordHash,
    role: 'CUSTOMER',
    country,
  });
  await AdminUser.create({ userId: user._id, role: 'SUPER_ADMIN', permissions: ['*'] });
  await mongoose.disconnect();
  console.log('Super admin created');
};

run();
