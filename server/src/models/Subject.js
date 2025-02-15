// server/src/models/Subject.js
import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  domain_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain',
    required: true,
  },
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

subjectSchema.index({ name: 1 });
subjectSchema.index({ domain_id: 1 });
subjectSchema.index({ subscription_id: 1 });
subjectSchema.index({ ownerOrgId: 1 });

const Subject = mongoose.models.Subject || mongoose.model('Subject', subjectSchema);
export default Subject;