import mongoose from 'mongoose';

const industrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Industry names must be unique
  },
  description: {
    type: String,
  },
  // NEW: reference to Subscription
  subscription_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: false, // or true if you want it mandatory
  },
}, { timestamps: true });

const Industry = mongoose.model('Industry', industrySchema);

export default Industry;
