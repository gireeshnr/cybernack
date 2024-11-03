import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  priceMonthly: { type: Number, required: true },
  priceYearly: { type: Number, required: true },
  features: [String],  // Array of feature strings
  modules: [String],   // Array of module names associated with the subscription
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// Ensure the model is only compiled once
const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);
export default Subscription;