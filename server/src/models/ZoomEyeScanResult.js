import mongoose from 'mongoose';

const ZoomEyeScanResultSchema = new mongoose.Schema({
  org: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  source: String,
  scanInfo: String,
  runStats: {
    finished: {
      type: Date,
      default: Date.now,
    },
    hosts: {
      up: Number,
      down: Number,
      total: Number
    }
  },
  additionalFields: mongoose.Schema.Types.Mixed,
  target: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ZoomEyeScanResult = mongoose.model('ZoomEyeScanResult', ZoomEyeScanResultSchema);
export default ZoomEyeScanResult;
