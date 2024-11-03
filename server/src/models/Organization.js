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
    default: true, // Default to true for newly created organizations
  },
});

// Check if the model already exists to avoid re-compilation
const Organization = mongoose.models.Organization || mongoose.model('Organization', OrganizationSchema);

export default Organization;