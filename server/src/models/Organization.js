import mongoose from 'mongoose';
const { Schema } = mongoose;

const OrganizationSchema = new Schema({
  name: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // If subscription is canceled in the future
  subscriptionEndDate: {
    type: Date,
    default: null,
  },
  // monthly/yearly tracking
  billingTerm: {
    type: String,
    default: '',
  },
  subscriptionStartDate: {
    type: Date,
    default: Date.now,
  },
});

const Organization =
  mongoose.models.Organization || mongoose.model('Organization', OrganizationSchema);

export default Organization;