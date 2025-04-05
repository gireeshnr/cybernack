// server/src/models/Role.js
import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  subjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    },
  ],
  // New subscription field
  subscription: {
    type: String,
    required: true,
    enum: ['Free', 'Standard', 'Enterprise'],
  },
  addedBy: {
    type: String,
    default: 'Cybernack',
  },
  organization_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    default: null,
  },
}, {
  timestamps: true,
});

const Role = mongoose.models.Role || mongoose.model('Role', roleSchema);
export default Role;