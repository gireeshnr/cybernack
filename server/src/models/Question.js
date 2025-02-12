import mongoose from 'mongoose';

/**
 * Example question schema:
 * - question_text: required
 * - answer_options: array of strings
 * - correct_answer: string (must match one of the answer_options typically)
 * - subject_id: references the Subject model
 * - subscription_id: references the Subscription model (NEW)
 * - difficulty, explanation, etc. (optional)
 */
const questionSchema = new mongoose.Schema(
  {
    question_text: {
      type: String,
      required: true,
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
    // NEW: reference to Subscription
    subscription_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      required: false,
    },
    difficulty: {
      type: String,
      default: 'Medium',
    },
    explanation: {
      type: String,
    },
  },
  { timestamps: true }
);

const Question = mongoose.model('Question', questionSchema);
export default Question;
