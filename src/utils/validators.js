const Joi = require('joi');

const phoneSchema = Joi.string().pattern(/^\+?[1-9]\d{7,14}$/).required();

const otpRequestSchema = Joi.object({
  phone: phoneSchema,
  countryCode: Joi.string().length(2).required(),
});

const otpVerifySchema = Joi.object({
  phone: phoneSchema,
  code: Joi.string().length(6).required(),
});

const registerSchema = Joi.object({
  otpToken: Joi.string().required(),
  role: Joi.string().valid('CUSTOMER', 'PROVIDER').required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  country: Joi.string().length(2).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  dob: Joi.date().required(),
  gender: Joi.string().valid('M', 'W', 'B').required(),
  nationalityType: Joi.string().valid('Citizen', 'Other').required(),
  idOrPassportNumber: Joi.string().required(),
  servicesOffered: Joi.array().items(Joi.string()).min(1).max(3).when('role', {
    is: 'PROVIDER',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});

const loginSchema = Joi.object({
  phone: phoneSchema,
});

const serviceCreateSchema = Joi.object({
  name: Joi.string().required(),
  genderTag: Joi.string().valid('M', 'W', 'B').required(),
  sortOrder: Joi.number().integer().min(0).default(0),
  isActiveByCountry: Joi.object().pattern(Joi.string().length(2), Joi.boolean()),
});

const pricingSchema = Joi.object({
  countryCode: Joi.string().length(2).required(),
  cityOrZoneId: Joi.string().required(),
  serviceId: Joi.string().required(),
  bookingFee: Joi.number().min(0).required(),
});

const jobRequestSchema = Joi.object({
  serviceId: Joi.string().required(),
  location: Joi.object({
    lat: Joi.number().required(),
    lng: Joi.number().required(),
    address: Joi.string().required(),
    cityOrZoneId: Joi.string().required(),
  }).required(),
  paymentReference: Joi.string().required(),
});

const providerLocationSchema = Joi.object({
  lat: Joi.number().required(),
  lng: Joi.number().required(),
});

const messageSchema = Joi.object({
  jobId: Joi.string().required(),
  toUserId: Joi.string().required(),
  text: Joi.string().min(1).required(),
});

const ratingSchema = Joi.object({
  jobId: Joi.string().required(),
  toUserId: Joi.string().required(),
  stars: Joi.number().min(1).max(5).required(),
  comment: Joi.string().allow('', null),
});

module.exports = {
  otpRequestSchema,
  otpVerifySchema,
  registerSchema,
  loginSchema,
  serviceCreateSchema,
  pricingSchema,
  jobRequestSchema,
  providerLocationSchema,
  messageSchema,
  ratingSchema,
};
