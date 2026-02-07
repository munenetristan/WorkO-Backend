const mongoose = require('mongoose');

const broadcastLogSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    providerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BroadcastLog', broadcastLogSchema);
