const ProviderProfile = require('../models/ProviderProfile');
const Job = require('../models/Job');
const BroadcastLog = require('../models/BroadcastLog');
const { JobStatus } = require('../utils/constants');
const { distanceMeters } = require('../services/geoService');
const { selectEligibleProviders, broadcastJob } = require('../services/jobService');

const setOnlineStatus = async (req, res, next) => {
  try {
    const profile = await ProviderProfile.findOneAndUpdate(
      { userId: req.user._id },
      { isOnline: req.body.isOnline },
      { new: true }
    );
    return res.status(200).json(profile);
  } catch (error) {
    return next(error);
  }
};

const updateLocation = async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    const profile = await ProviderProfile.findOneAndUpdate(
      { userId: req.user._id },
      { location: { type: 'Point', coordinates: [lng, lat] } },
      { new: true }
    );
    return res.status(200).json(profile);
  } catch (error) {
    return next(error);
  }
};

const uploadDocument = async (req, res, next) => {
  try {
    const { docType } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: 'File required' });
    }
    const profile = await ProviderProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $push: { documents: { docType, fileUrl: req.file.path } } },
      { new: true }
    );
    return res.status(200).json(profile);
  } catch (error) {
    return next(error);
  }
};

const acceptJob = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;
    const job = await Job.findOneAndUpdate(
      { _id: jobId, status: JobStatus.BROADCASTED, providerId: null },
      { providerId: req.user._id, status: JobStatus.ACCEPTED, assignedAt: new Date() },
      { new: true }
    );
    if (!job) {
      return res.status(409).json({ message: 'Job already accepted' });
    }
    await BroadcastLog.findOneAndUpdate({ jobId }, { acceptedBy: req.user._id });
    return res.status(200).json(job);
  } catch (error) {
    return next(error);
  }
};

const rejectJob = async (req, res, next) => {
  try {
    return res.status(200).json({ message: 'Job rejected' });
  } catch (error) {
    return next(error);
  }
};

const cancelJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, providerId: req.user._id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    const now = new Date();
    const elapsedSec = (now - job.assignedAt) / 1000;
    if (elapsedSec > job.cancellationRules.providerCancelWindowSec) {
      return res.status(400).json({ message: 'Cancel window expired' });
    }

    job.status = JobStatus.BROADCASTED;
    job.providerId = null;
    job.assignedAt = null;
    await job.save();

    const profile = await ProviderProfile.findOne({ userId: req.user._id });
    if (profile) {
      const last = profile.cancelStats.lastCancelAt;
      if (!last || now - last > 24 * 60 * 60 * 1000) {
        profile.cancelStats.count = 1;
      } else {
        profile.cancelStats.count += 1;
      }
      profile.cancelStats.lastCancelAt = now;
      if (profile.cancelStats.count >= 4) {
        profile.suspendedUntil = new Date(now.getTime() + 12 * 60 * 60 * 1000);
      }
      await profile.save();
    }

    const providers = await selectEligibleProviders({
      serviceId: job.serviceId,
      location: job.location,
    });
    await broadcastJob({ job, providers });

    return res.status(200).json(job);
  } catch (error) {
    return next(error);
  }
};

const startJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, providerId: req.user._id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    const profile = await ProviderProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }
    const [lng, lat] = profile.location.coordinates;
    const distance = distanceMeters(lat, lng, job.location.lat, job.location.lng);
    if (distance > 20) {
      return res.status(400).json({ message: 'Too far from job location' });
    }
    job.status = JobStatus.STARTED;
    await job.save();
    return res.status(200).json(job);
  } catch (error) {
    return next(error);
  }
};

const completeJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, providerId: req.user._id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    job.status = JobStatus.COMPLETED;
    await job.save();
    await ProviderProfile.findOneAndUpdate({ userId: req.user._id }, { $inc: { jobsCompleted: 1 } });
    return res.status(200).json(job);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  setOnlineStatus,
  updateLocation,
  uploadDocument,
  acceptJob,
  rejectJob,
  cancelJob,
  startJob,
  completeJob,
};
