const ProviderProfile = require('../models/ProviderProfile');
const Job = require('../models/Job');
const Service = require('../models/Service');
const { sendBroadcast } = require('./notificationService');
const BroadcastLog = require('../models/BroadcastLog');

const selectEligibleProviders = async ({ serviceId, location, radiusMeters = 5000 }) => {
  const service = await Service.findById(serviceId);
  if (!service) {
    return [];
  }

  const busyProviderIds = await Job.find({
    status: { $in: ['ACCEPTED', 'STARTED'] },
    providerId: { $ne: null },
  }).distinct('providerId');

  const now = new Date();
  const pipeline = [
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [location.lng, location.lat] },
        distanceField: 'distanceMeters',
        maxDistance: radiusMeters,
        spherical: true,
      },
    },
    {
      $match: {
        verificationStatus: 'APPROVED',
        isOnline: true,
        isBanned: false,
        servicesOffered: serviceId,
        $or: [{ suspendedUntil: { $exists: false } }, { suspendedUntil: { $lte: now } }],
        userId: { $nin: busyProviderIds },
      },
    },
  ];

  if (service.genderTag !== 'B') {
    pipeline.push({
      $match: {
        gender: service.genderTag,
      },
    });
  }

  pipeline.push({ $sort: { ratingAvg: -1, distanceMeters: 1 } });
  pipeline.push({ $limit: 10 });

  const providers = await ProviderProfile.aggregate(pipeline);
  return providers;
};

const broadcastJob = async ({ job, providers }) => {
  const providerIds = providers.map((provider) => provider.userId.toString());
  await BroadcastLog.create({
    jobId: job._id,
    providerIds,
  });
  await sendBroadcast({
    providerIds,
    payload: {
      jobId: job._id,
      serviceId: job.serviceId,
      location: job.location,
      bookingFee: job.bookingFee,
    },
  });
  return providerIds;
};

module.exports = { selectEligibleProviders, broadcastJob };
