import mongoose from 'mongoose';

const SecurityTrailsScanResultSchema = new mongoose.Schema({
  domain: {
    type: String,
    required: true,
  },
  rawScanData: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const SecurityTrailsScanResult = mongoose.model('SecurityTrailsScanResult', SecurityTrailsScanResultSchema);
export default SecurityTrailsScanResult;
