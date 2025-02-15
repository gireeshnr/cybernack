// server/src/models/Domain.js
import mongoose from 'mongoose';

const domainSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  subjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    },
  ],
  industries: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Industry',
    },
  ],
  subscription_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
  },
  ownerOrgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: false,
  },
  // New field: auto-populated with client name or "Cybernack"
  addedBy: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

domainSchema.index({ name: 1 });
domainSchema.index({ subscription_id: 1 });
domainSchema.index({ ownerOrgId: 1 });

const Domain = mongoose.models.Domain || mongoose.model('Domain', domainSchema);
export default Domain;