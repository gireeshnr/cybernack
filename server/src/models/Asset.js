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
  ports: {
    type: [Number],
    default: []
  }
});

const Asset = mongoose.model('Asset', AssetSchema);

export default Asset;
