const Job = require('../models/Job');
const Pricing = require('../models/Pricing');
const ProviderProfile = require('../models/ProviderProfile');
const User = require('../models/User');
const Message = require('../models/Message');
const Rating = require('../models/Rating');
const { JobStatus } = require('../utils/constants');
const { verifyPayment } = require('../services/paymentService');
const { selectEligibleProviders, broadcastJob } = require('../services/jobService');

const requestJob = async (req, res, next) => {
  try {
    const { serviceId, location, paymentReference } = req.body;
    const pricing = await Pricing.findOne({
      serviceId,
      countryCode: req.user.country,
      cityOrZoneId: location.cityOrZoneId,
    });
    if (!pricing) {
      return res.status(400).json({ message: 'Pricing not configured' });
    }

    const providers = await selectEligibleProviders({
      serviceId,
      location,
    });

    if (providers.length === 0) {
      return res.status(404).json({ message: 'No providers available' });
    }

    const payment = await verifyPayment(paymentReference);
    if (!payment.success) {
      return res.status(400).json({ message: 'Payment failed' });
    }

    const job = await Job.create({
      customerId: req.user._id,
      serviceId,
      status: JobStatus.BROADCASTED,
      location,
      bookingFee: pricing.bookingFee,
      paymentStatus: 'PAID',
    });

    await broadcastJob({ job, providers });

    return res.status(201).json(job);
  } catch (error) {
    return next(error);
  }
};

const cancelJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, customerId: req.user._id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (job.status !== JobStatus.ACCEPTED) {
      return res.status(400).json({ message: 'Job cannot be cancelled' });
    }
    const now = new Date();
    const elapsedSec = (now - job.assignedAt) / 1000;
    if (elapsedSec > job.cancellationRules.customerCancelWindowSec) {
      return res.status(400).json({ message: 'Cancel window expired' });
    }
    job.status = JobStatus.BROADCASTED;
    job.providerId = null;
    job.assignedAt = null;
    await job.save();

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

const jobStatus = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, customerId: req.user._id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    return res.status(200).json(job);
  } catch (error) {
    return next(error);
  }
};

const trackProvider = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, customerId: req.user._id });
    if (!job || !job.providerId) {
      return res.status(404).json({ message: 'Provider not assigned' });
    }
    const providerUser = await User.findById(job.providerId);
    const providerProfile = await ProviderProfile.findOne({ userId: job.providerId });
    return res.status(200).json({
      provider: {
        name: providerUser ? `${providerUser.firstName} ${providerUser.lastName}` : 'Provider',
        ratingAvg: providerProfile?.ratingAvg || 0,
        jobsCompleted: providerProfile?.jobsCompleted || 0,
        location: providerProfile?.location,
      },
      etaMinutes: null,
    });
  } catch (error) {
    return next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const message = await Message.create({
      jobId: req.body.jobId,
      fromUserId: req.user._id,
      toUserId: req.body.toUserId,
      text: req.body.text,
    });
    return res.status(201).json(message);
  } catch (error) {
    return next(error);
  }
};

const listMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({ jobId: req.params.jobId }).sort({ createdAt: 1 });
    return res.status(200).json(messages);
  } catch (error) {
    return next(error);
  }
};

const rateUser = async (req, res, next) => {
  try {
    const rating = await Rating.create({
      jobId: req.body.jobId,
      fromUserId: req.user._id,
      toUserId: req.body.toUserId,
      stars: req.body.stars,
      comment: req.body.comment,
    });
    return res.status(201).json(rating);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  requestJob,
  cancelJob,
  jobStatus,
  trackProvider,
  sendMessage,
  listMessages,
  rateUser,
};
