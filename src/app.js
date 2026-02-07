const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const providerRoutes = require('./routes/providerRoutes');
const customerRoutes = require('./routes/customerRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const pricingRoutes = require('./routes/pricingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/provider', providerRoutes);
app.use('/api/v1/customer', customerRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/pricing', pricingRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use(errorHandler);

module.exports = app;
