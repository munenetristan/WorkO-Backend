const express = require('express');
const { auth } = require('../middleware/auth');
const { approveProvider, rejectProvider } = require('../controllers/adminController');

const router = express.Router();

router.use(auth);

router.post('/providers/:id/approve', approveProvider);
router.post('/providers/:id/reject', rejectProvider);

module.exports = router;
