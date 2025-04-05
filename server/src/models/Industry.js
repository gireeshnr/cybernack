import mongoose from 'mongoose';

const industrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    // Reference to the subscription document (if applicable).
    subscription_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
    },
    // If null, this record is "global" (created by superadmin).
    // Otherwise, it’s "local" for a specific organization (created by an admin).
    ownerOrgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
    },
    addedBy: {
      type: String,
      default: 'Cybernack',
    },
    // Who created it: 'superadmin' => global, 'admin' => local
    creatorRole: {
      type: String,
      required: true,
      enum: ['superadmin', 'admin'],
    },
  },
  { timestamps: true }
);

// Ensure that within a given organization, the industry name is unique.
industrySchema.index({ name: 1, ownerOrgId: 1 }, { unique: true });
industrySchema.index({ subscription_id: 1 });
industrySchema.index({ ownerOrgId: 1 });

const Industry =
  mongoose.models.Industry || mongoose.model('Industry', industrySchema);

export default Industry;