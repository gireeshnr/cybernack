// server/src/models/TrainingPath.js
import mongoose from 'mongoose';

// Optional sub-schema for subject mapping
const subjectMappingSchema = new mongoose.Schema(
  {
    subject_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    isMandatory: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const trainingPathSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    // Array of Role references
    role_ids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
      },
    ],
    // Subject references with extra metadata
    subjectMappings: [subjectMappingSchema],
    // Required subscription enum
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
  },
  {
    timestamps: true,
  }
);

const TrainingPath =
  mongoose.models.TrainingPath || mongoose.model('TrainingPath', trainingPathSchema);
export default TrainingPath;