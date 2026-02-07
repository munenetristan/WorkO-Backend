const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema(
  {
    iso2: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true },
    dialingCode: { type: String, required: true },
    flagEmoji: { type: String },
    defaultLanguage: { type: String, default: 'en' },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Country', countrySchema);
