const Country = require('../models/Country');

const listCountries = async (req, res, next) => {
  try {
    const query = req.query.enabledOnly === 'false' ? {} : { enabled: true };
    const countries = await Country.find(query).sort({ name: 1 });
    return res.status(200).json(countries);
  } catch (error) {
    return next(error);
  }
};

const createCountry = async (req, res, next) => {
  try {
    const country = await Country.create({
      ...req.body,
      iso2: req.body.iso2.toUpperCase(),
    });
    return res.status(201).json(country);
  } catch (error) {
    return next(error);
  }
};

const updateCountry = async (req, res, next) => {
  try {
    const update = { ...req.body };
    if (update.iso2) {
      update.iso2 = update.iso2.toUpperCase();
    }
    const country = await Country.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!country) {
      return res.status(404).json({ message: 'Country not found' });
    }
    return res.status(200).json(country);
  } catch (error) {
    return next(error);
  }
};

const deleteCountry = async (req, res, next) => {
  try {
    const country = await Country.findByIdAndDelete(req.params.id);
    if (!country) {
      return res.status(404).json({ message: 'Country not found' });
    }
    return res.status(200).json({ message: 'Country deleted' });
  } catch (error) {
    return next(error);
  }
};

module.exports = { listCountries, createCountry, updateCountry, deleteCountry };
