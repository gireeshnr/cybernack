import mongoose from 'mongoose';

const industrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    // If you no longer need 'subjects', you can remove it:
    // subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
  },
  {
    timestamps: true,
    // Uncomment if you want a custom collection name:
    // collection: 'industries',
  }
);

const Industry = mongoose.model('Industry', industrySchema);

export default Industry;