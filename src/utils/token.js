const jwt = require('jsonwebtoken');

const createAccessToken = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });

const createOtpToken = (phone) =>
  jwt.sign({ phone }, process.env.JWT_SECRET, { expiresIn: '10m' });

const verifyOtpToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

module.exports = { createAccessToken, createOtpToken, verifyOtpToken };
