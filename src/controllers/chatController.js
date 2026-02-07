const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Job = require('../models/Job');

const getChat = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    const isParticipant =
      job.customerId.toString() === req.user._id.toString() ||
      (job.providerId && job.providerId.toString() === req.user._id.toString());
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not allowed' });
    }
    const chat = await Chat.findOneAndUpdate(
      { jobId: job._id },
      { jobId: job._id, participants: [job.customerId, job.providerId].filter(Boolean) },
      { upsert: true, new: true }
    );
    const messages = await Message.find({ jobId: job._id }).sort({ createdAt: 1 });
    return res.status(200).json({ chat, messages });
  } catch (error) {
    return next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    const isParticipant =
      job.customerId.toString() === req.user._id.toString() ||
      (job.providerId && job.providerId.toString() === req.user._id.toString());
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not allowed' });
    }
    const toUserId =
      req.user._id.toString() === job.customerId.toString() ? job.providerId : job.customerId;
    const message = await Message.create({
      jobId: job._id,
      fromUserId: req.user._id,
      toUserId,
      text: req.body.text,
    });
    return res.status(201).json(message);
  } catch (error) {
    return next(error);
  }
};

module.exports = { getChat, sendMessage };
