// server/src/models/Domain.js
import mongoose from 'mongoose';

const domainSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes for faster queries
domainSchema.index({ name: 1 });
domainSchema.index({ subjects: 1 });

const Domain = mongoose.models.Domain || mongoose.model('Domain', domainSchema);
export default Domain;