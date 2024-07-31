import mongoose from 'mongoose';
const { Schema } = mongoose;

const ThreatIntelSchema = new Schema({
  org: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const ThreatIntel = mongoose.model('ThreatIntel', ThreatIntelSchema);

export default ThreatIntel;
