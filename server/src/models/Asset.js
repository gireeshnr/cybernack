import mongoose from 'mongoose';

const AssetSchema = new mongoose.Schema({
  domain: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  org: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  ip: {
    type: String,
    default: 'N/A'
  },
  ports: [{
    protocol: String,
    portid: Number,
    state: String,
    reason: String,
    reason_ttl: Number,
    service: String,
    product: String,
    extra_info: String,
    method: String,
    confidence: Number
  }],
  sources: {
    type: Map,
    of: {
      lastSeen: {
        type: Date,
        default: Date.now
      },
      data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      }
    }
  },
  status: {
    type: String,
    default: 'active'
  },
  os: {
    type: String,
    default: ''
  },
  identifier: {
    type: String,
    unique: true,
    sparse: true,
  },
  hostnames: [String],
  uptime: Number,
  tcpSequence: [String],
  ipIdSequence: [String],
  tcpTimestampSeq: [String],
  srtt: Number,
  rttVariance: Number,
  timeout: Number,
  distance: Number,
  traceroute: [{
    ttl: Number,
    ipaddr: String,
    rtt: Number,
    host: String,
  }],
}, { timestamps: true });

const Asset = mongoose.model('Asset', AssetSchema);
export default Asset;
