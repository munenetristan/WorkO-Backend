const mongoose = require('mongoose');
const { GenderTag } = require('../utils/constants');

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    genderTag: { type: String, enum: Object.values(GenderTag), required: true },
    isActiveByCountry: { type: Map, of: Boolean, default: {} },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
