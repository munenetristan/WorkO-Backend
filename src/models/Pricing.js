const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema(
  {
    countryCode: { type: String, required: true, index: true },
    cityName: { type: String, required: true, index: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    bookingFee: { type: Number, required: true },
  },
  { timestamps: true }
);

pricingSchema.index({ countryCode: 1, cityName: 1, serviceId: 1 }, { unique: true });

module.exports = mongoose.model('Pricing', pricingSchema);
