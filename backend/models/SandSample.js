const mongoose = require('mongoose');

const sandSampleSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  // Grain size analysis data
  numberOfGrains: {
    type: Number,
    required: true,
    min: 0
  },
  // Grain size percentiles
  d10: {
    type: Number,
    required: true,
    min: 0
  },
  d16: {
    type: Number,
    required: true,
    min: 0
  },
  d25: {
    type: Number,
    required: true,
    min: 0
  },
  d50: {
    type: Number,
    required: true,
    min: 0
  },
  d65: {
    type: Number,
    required: true,
    min: 0
  },
  d75: {
    type: Number,
    required: true,
    min: 0
  },
  d84: {
    type: Number,
    required: true,
    min: 0
  },
  d90: {
    type: Number,
    required: true,
    min: 0
  },
  // Statistical measures
  dmean: {
    type: Number,
    required: true,
    min: 0
  },
  dmed: {
    type: Number,
    required: true,
    min: 0
  },
  // Sediment classification based on Dmed
  sedimentType: {
    type: String,
    required: true,
    enum: ['Silt/Clay', 'Fine Sand', 'Medium Sand', 'Very Coarse Sand', 'Gravel']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a geospatial index for efficient location-based queries
sandSampleSchema.index({ latitude: 1, longitude: 1 });

const SandSample = mongoose.model('SandSample', sandSampleSchema);

module.exports = SandSample;