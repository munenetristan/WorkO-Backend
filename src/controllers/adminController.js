const ProviderProfile = require('../models/ProviderProfile');

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

module.exports = { approveProvider, rejectProvider };
