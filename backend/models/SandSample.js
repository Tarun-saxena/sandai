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
  diameter: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  imageURL: {
    type: String,
    required: false
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