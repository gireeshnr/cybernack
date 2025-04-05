// server/src/models/Question.js
import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    question_number: {
      type: String,
      required: true,
      trim: true,
    },
    short_text: {
      type: String,
      required: true,
      trim: true,
    },
    full_text: {
      type: String,
      default: '',
      trim: true,
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
      default: '',
    },
    addedBy: {
      type: String,
      default: '',
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Enforce that question numbers are unique within each organization.
questionSchema.index({ question_number: 1, ownerOrgId: 1 }, { unique: true });
questionSchema.index({ subject_id: 1 });
questionSchema.index({ subscription_id: 1 });
questionSchema.index({ ownerOrgId: 1 });

const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);
export default Question;