// server/src/models/Subject.js
import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  domain_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain',
    required: true,
  },
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

const Subject = mongoose.models.Subject || mongoose.model('Subject', subjectSchema);
export default Subject;