// server/src/models/OrganizationSettings.js
import mongoose from 'mongoose';

// 4th level: question
const questionSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  active: { type: Boolean, default: true },
});

// 3rd level: subject
const subjectSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  active: { type: Boolean, default: true },
  questions: [questionSchema],
});

// 2nd level: domain
const domainSchema = new mongoose.Schema({
  domainId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain',
    required: true,
  },
  active: { type: Boolean, default: true },
  subjects: [subjectSchema],
});

// 1st level: industry
const industrySchema = new mongoose.Schema({
  industryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Industry',
    required: true,
  },
  active: { type: Boolean, default: true },
  domains: [domainSchema],
});

// Main organization settings schema
const organizationSettingsSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      unique: true,
    },

    /**
     * The numeric subscription tier used to build this doc:
     *   1 = Free, 2 = Standard, 3 = Enterprise
     * This helps us rebuild if the org’s subscription changes.
     */
    subscriptionTier: {
      type: Number,
      default: 1,
    },

    // The entire Industry->Domain->Subject->Question hierarchy
    industries: [industrySchema],
  },
  { timestamps: true }
);

const OrganizationSettings =
  mongoose.models.OrganizationSettings ||
  mongoose.model('OrganizationSettings', organizationSettingsSchema);

export default OrganizationSettings;