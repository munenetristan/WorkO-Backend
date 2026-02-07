const mongoose = require('mongoose');
const { JobStatus } = require('../utils/constants');

const jobSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    status: { type: String, enum: Object.values(JobStatus), default: JobStatus.REQUESTED },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, required: true },
      cityName: { type: String, required: true },
      countryIso2: { type: String, required: true },
    },
    bookingFee: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' },
    bookingFeePaid: { type: Boolean, default: false },
    distanceKm: { type: Number },
    cancellationRules: {
      providerCancelWindowSec: { type: Number, default: 90 },
      customerCancelWindowSec: { type: Number, default: 120 },
    },
    assignedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
