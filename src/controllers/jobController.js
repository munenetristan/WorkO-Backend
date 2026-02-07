const Job = require('../models/Job');
const Pricing = require('../models/Pricing');
const ProviderProfile = require('../models/ProviderProfile');
const BroadcastLog = require('../models/BroadcastLog');
const Chat = require('../models/Chat');
const { JobStatus } = require('../utils/constants');
const { verifyPayment, confirmBookingPayment } = require('../services/paymentService');
const { selectEligibleProviders, broadcastJob } = require('../services/jobService');
const { distanceMeters } = require('../services/geoService');

const requestJob = async (req, res, next) => {
  try {
    const { serviceId, location } = req.body;
    const pricing = await Pricing.findOne({
      serviceId,
      countryCode: location.countryIso2,
      cityName: location.cityName,
    });
    if (!pricing) {
      return res.status(400).json({ message: 'Pricing not configured' });
    }

    const job = await Job.create({
      customerId: req.user._id,
      serviceId,
      status: JobStatus.REQUESTED,
      location,
      bookingFee: pricing.bookingFee,
      paymentStatus: 'PENDING',
      bookingFeePaid: false,
    });

    return res.status(201).json(job);
  } catch (error) {
    return next(error);
  }
};

const payJob = async (req, res, next) => {
  try {
    const { paymentReference } = req.body;
    const job = await Job.findOne({ _id: req.params.id, customerId: req.user._id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (job.bookingFeePaid) {
      return res.status(200).json(job);
    }
    const payment = paymentReference
      ? await verifyPayment(paymentReference)
      : await confirmBookingPayment(job._id.toString());
    if (!payment.success) {
      return res.status(400).json({ message: 'Payment failed' });
    }

    const providers = await selectEligibleProviders({
      serviceId: job.serviceId,
      location: job.location,
    });
    if (providers.length === 0) {
      return res.status(404).json({ message: 'No providers available' });
    }

    job.bookingFeePaid = true;
    job.paymentStatus = 'PAID';
    job.status = JobStatus.BROADCASTED;
    await job.save();

    await broadcastJob({ job, providers });

    return res.status(200).json(job);
  } catch (error) {
    return next(error);
  }
};

const acceptJob = async (req, res, next) => {
  try {
    const providerProfile = await ProviderProfile.findOne({ userId: req.user._id });
    if (!providerProfile || providerProfile.verificationStatus !== 'APPROVED') {
      return res.status(403).json({ message: 'Provider not approved' });
    }
    if (providerProfile.isBanned) {
      return res.status(403).json({ message: 'Provider is banned' });
    }
    if (providerProfile.suspendedUntil && providerProfile.suspendedUntil > new Date()) {
      return res.status(403).json({ message: 'Provider is suspended' });
    }
    if (!providerProfile.isOnline) {
      return res.status(400).json({ message: 'Provider is offline' });
    }
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, status: JobStatus.BROADCASTED, providerId: null },
      { providerId: req.user._id, status: JobStatus.ACCEPTED, assignedAt: new Date() },
      { new: true }
    );
    if (!job) {
      return res.status(409).json({ message: 'Job already accepted' });
    }
    await BroadcastLog.findOneAndUpdate({ jobId: job._id }, { acceptedBy: req.user._id });
    providerProfile.activeJobId = job._id;
    await providerProfile.save();
    await Chat.findOneAndUpdate(
      { jobId: job._id },
      { jobId: job._id, participants: [job.customerId, req.user._id] },
      { upsert: true, new: true }
    );
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
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const now = new Date();
    if (req.user.role === 'PROVIDER') {
      if (!job.providerId || job.providerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not assigned to this job' });
      }
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
        profile.activeJobId = null;
        await profile.save();
      }
    } else {
      if (job.customerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not allowed' });
      }
      if (job.status !== JobStatus.ACCEPTED) {
        return res.status(400).json({ message: 'Job cannot be cancelled' });
      }
      const elapsedSec = (now - job.assignedAt) / 1000;
      if (elapsedSec > job.cancellationRules.customerCancelWindowSec) {
        return res.status(400).json({ message: 'Cancel window expired' });
      }
      const previousProviderId = job.providerId;
      job.status = JobStatus.BROADCASTED;
      job.providerId = null;
      job.assignedAt = null;
      await job.save();
      if (previousProviderId) {
        await ProviderProfile.findOneAndUpdate(
          { userId: previousProviderId },
          { activeJobId: null }
        );
      }
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
    const job = await Job.findOne({ _id: req.params.id, providerId: req.user._id });
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
    const job = await Job.findOne({ _id: req.params.id, providerId: req.user._id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    job.status = JobStatus.COMPLETED;
    await job.save();
    await ProviderProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $inc: { jobsCompleted: 1 }, activeJobId: null }
    );
    return res.status(200).json(job);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  requestJob,
  payJob,
  acceptJob,
  rejectJob,
  cancelJob,
  startJob,
  completeJob,
};
