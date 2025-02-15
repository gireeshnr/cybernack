// server/src/models/Industry.js
import mongoose from 'mongoose';

const industrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Industry names must be unique
  },
  description: String,
  subscription_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
  },
  ownerOrgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: false,
  },
  // New field: auto-populated with the client organization name or "Cybernack" for superadmin
  addedBy: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

industrySchema.index({ subscription_id: 1 });
industrySchema.index({ ownerOrgId: 1 });

const Industry = mongoose.model('Industry', industrySchema);
export default Industry;