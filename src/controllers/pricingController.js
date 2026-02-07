const Pricing = require('../models/Pricing');

const upsertPricing = async (req, res, next) => {
  try {
    const { countryCode, cityName, serviceId, bookingFee } = req.body;
    const pricing = await Pricing.findOneAndUpdate(
      { countryCode: countryCode.toUpperCase(), cityName, serviceId },
      { bookingFee },
      { new: true, upsert: true }
    );
    return res.status(200).json(pricing);
  } catch (error) {
    return next(error);
  }
};

const listPricing = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.countryCode) {
      query.countryCode = req.query.countryCode.toUpperCase();
    }
    if (req.query.cityName) {
      query.cityName = req.query.cityName;
    }
    if (req.query.serviceId) {
      query.serviceId = req.query.serviceId;
    }
    const pricing = await Pricing.find(query);
    return res.status(200).json(pricing);
  } catch (error) {
    return next(error);
  }
};

module.exports = { upsertPricing, listPricing };
