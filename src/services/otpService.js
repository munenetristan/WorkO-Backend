const bcrypt = require('bcryptjs');
const Otp = require('../models/Otp');

const generateCode = () => `${Math.floor(100000 + Math.random() * 900000)}`;

const requestOtp = async (phone) => {
  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await Otp.create({ phone, codeHash, expiresAt });
  return { code, expiresAt };
};

const verifyOtp = async (phone, code) => {
  const otp = await Otp.findOne({ phone }).sort({ createdAt: -1 });
  if (!otp) {
    return false;
  }
  const isValid = await bcrypt.compare(code, otp.codeHash);
  if (!isValid) {
    return false;
  }
  return otp.expiresAt > new Date();
};

module.exports = { requestOtp, verifyOtp };
