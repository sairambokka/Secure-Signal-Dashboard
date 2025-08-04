const mongoose = require('mongoose');

const signalSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: [true, 'User ID is required'],
    trim: true
  },
  agent_id: {
    type: String,
    required: [true, 'Agent ID is required'],
    trim: true
  },
  signal_type: {
    type: String,
    required: [true, 'Signal type is required'],
    trim: true,
    enum: {
      values: ['HRV', 'GSR', 'respiration', 'temperature', 'heart_rate'],
      message: 'Signal type must be one of: HRV, GSR, respiration, temperature, heart_rate'
    }
  },
  timestamp: {
    type: Date,
    required: [true, 'Timestamp is required']
  },
  payload: {
    raw: {
      type: [mongoose.Schema.Types.Mixed],
      required: [true, 'Raw data is required']
    },
    avg: {
      type: Number,
      required: [true, 'Average value is required']
    },
    sdnn: {
      type: Number
    }
  },
  context: {
    activity: {
      type: String,
      trim: true
    },
    environment: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true
});

signalSchema.index({ user_id: 1, signal_type: 1 });
signalSchema.index({ timestamp: -1 });
signalSchema.index({ agent_id: 1 });

module.exports = mongoose.model('Signal', signalSchema);