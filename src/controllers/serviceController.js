const Service = require('../models/Service');

const listServices = async (req, res, next) => {
  try {
    const { countryCode, country } = req.query;
    const query = {};
    const selectedCountry = countryCode || country;
    if (selectedCountry) {
      query.$or = [
        { [`isActiveByCountry.${selectedCountry.toUpperCase()}`]: { $exists: false } },
        { [`isActiveByCountry.${selectedCountry.toUpperCase()}`]: true },
      ];
    }
    const services = await Service.find(query).sort({ sortOrder: 1 });
    return res.status(200).json(services);
  } catch (error) {
    return next(error);
  }
};

const createService = async (req, res, next) => {
  try {
    const service = await Service.create(req.body);
    return res.status(201).json(service);
  } catch (error) {
    return next(error);
  }
};

const updateService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    return res.status(200).json(service);
  } catch (error) {
    return next(error);
  }
};

const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    return res.status(200).json({ message: 'Service deleted' });
  } catch (error) {
    return next(error);
  }
};

const setServiceCountryStatus = async (req, res, next) => {
  try {
    const { countryCode, enabled } = req.body;
    const update = {
      $set: { [`isActiveByCountry.${countryCode.toUpperCase()}`]: enabled },
    };
    const service = await Service.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    return res.status(200).json(service);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listServices,
  createService,
  updateService,
  deleteService,
  setServiceCountryStatus,
};
