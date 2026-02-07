const express = require('express');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { chatMessageSchema } = require('../utils/validators');
const { getChat, sendMessage } = require('../controllers/chatController');

const router = express.Router();

router.get('/:jobId', auth, getChat);
router.post('/:jobId/messages', auth, validate(chatMessageSchema), sendMessage);

module.exports = router;
