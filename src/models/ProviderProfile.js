const mongoose = require('mongoose');

const cancelStatsSchema = new mongoose.Schema(
  {
    count: { type: Number, default: 0 },
    lastCancelAt: { type: Date },
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    docType: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const providerProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    gender: { type: String, required: true },
    dob: { type: Date, required: true },
    nationalityType: { type: String, enum: ['Citizen', 'Other'], required: true },
    idOrPassportNumber: { type: String, required: true },
    servicesOffered: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true }],
    verificationStatus: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    isOnline: { type: Boolean, default: false },
    ratingAvg: { type: Number, default: 0 },
    jobsCompleted: { type: Number, default: 0 },
    cancelStats: { type: cancelStatsSchema, default: () => ({}) },
    suspendedUntil: { type: Date },
    isBanned: { type: Boolean, default: false },
    activeJobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    documents: { type: [documentSchema], default: [] },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
  },
  { timestamps: true }
);

providerProfileSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('ProviderProfile', providerProfileSchema);
