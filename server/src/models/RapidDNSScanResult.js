import mongoose from 'mongoose';

const RapidDNSScanResultSchema = new mongoose.Schema({
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

const RapidDNSScanResult = mongoose.model('RapidDNSScanResult', RapidDNSScanResultSchema);
export default RapidDNSScanResult;