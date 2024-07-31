import mongoose from 'mongoose';

const CensysScanResultSchema = new mongoose.Schema({
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

const CensysScanResult = mongoose.model('CensysScanResult', CensysScanResultSchema);
export default CensysScanResult;
