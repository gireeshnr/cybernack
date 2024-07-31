import mongoose from 'mongoose';

const ShodanScanResultSchema = new mongoose.Schema({
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

const ShodanScanResult = mongoose.model('ShodanScanResult', ShodanScanResultSchema);
export default ShodanScanResult;
