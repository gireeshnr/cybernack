// server/src/models/Question.js
import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question_text: {
    type: String,
    required: true,
    trim: true,
  },
  // Optional duplicate field if needed
  question: {
    type: String,
  },
  answer_options: {
    type: [String],
    required: true,
  },
  correct_answer: {
    type: String,
    required: true,
  },
  subject_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
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
  difficulty: {
    type: String,
    default: 'Medium',
  },
  explanation: {
    type: String,
  },
  // New field: auto-populated with client name or "Cybernack"
  addedBy: {
    type: String,
    default: '',
  },
}, { timestamps: true });

questionSchema.index({ subject_id: 1 });
questionSchema.index({ subscription_id: 1 });
questionSchema.index({ ownerOrgId: 1 });

const Question = mongoose.model('Question', questionSchema);
export default Question;