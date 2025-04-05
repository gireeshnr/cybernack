// server/src/models/Subject.js
import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    // Reference to the Domain that this subject belongs to.
    domain_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Domain',
      required: true,
    },
    // The subscription level with which this subject is associated.
    subscription_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
    },
    // For global records, ownerOrgId is null; for local records, it is set.
    ownerOrgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
    },
    addedBy: {
      type: String,
      default: 'Cybernack',
    },
    // Indicates whether the record was created by a superadmin (global) or admin (local).
    creatorRole: {
      type: String,
      required: true,
      enum: ['superadmin', 'admin'],
    },
  },
  { timestamps: true }
);

// Ensure that within a given organization, the subject name is unique.
subjectSchema.index({ name: 1, ownerOrgId: 1 }, { unique: true });
subjectSchema.index({ domain_id: 1 });
subjectSchema.index({ subscription_id: 1 });
subjectSchema.index({ ownerOrgId: 1 });

const Subject = mongoose.models.Subject || mongoose.model('Subject', subjectSchema);
export default Subject;