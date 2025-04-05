import mongoose from 'mongoose';

const domainSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    industry_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Industry',
      required: true,
    },
    subscription_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
    },
    ownerOrgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
    },
    addedBy: {
      type: String,
      default: 'Cybernack',
    },
    // Who created the record: 'superadmin' means Global, 'admin' means Local.
    creatorRole: {
      type: String,
      required: true,
      enum: ['superadmin', 'admin'],
    },
  },
  { timestamps: true }
);

domainSchema.index({ name: 1, ownerOrgId: 1 }, { unique: true });
domainSchema.index({ subscription_id: 1 });
domainSchema.index({ ownerOrgId: 1 });
domainSchema.index({ industry_id: 1 });

const Domain =
  mongoose.models.Domain || mongoose.model('Domain', domainSchema);
export default Domain;