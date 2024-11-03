import Subscription from '../models/Subscription.js';

// Fetch all subscriptions
export const getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({});
    res.status(200).json(subscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ message: 'Error fetching subscriptions' });
  }
};

// Create a new subscription
export const createSubscription = async (req, res) => {
  const { name, description, priceMonthly, priceYearly, features, modules, isActive } = req.body;

  // Validate required fields
  if (!name || !priceMonthly || !priceYearly) {
    return res.status(400).json({ message: 'Name, monthly price, and yearly price are required.' });
  }

  try {
    const existingSubscription = await Subscription.findOne({ name });
    if (existingSubscription) {
      return res.status(400).json({ message: 'Subscription name already exists.' });
    }

    const newSubscription = new Subscription({ name, description, priceMonthly, priceYearly, features, modules, isActive });
    await newSubscription.save();
    res.status(201).json({ message: 'Subscription created successfully', subscription: newSubscription });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ message: 'Error creating subscription' });
  }
};

// Update subscription
export const updateSubscription = async (req, res) => {
  const { name, description, priceMonthly, priceYearly, features, modules, isActive } = req.body;
  const subId = req.params.subId;

  // Validate required fields
  if (!name || !priceMonthly || !priceYearly) {
    return res.status(400).json({ message: 'Name, monthly price, and yearly price are required.' });
  }

  try {
    const existingSubscription = await Subscription.findById(subId);
    if (!existingSubscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (name !== existingSubscription.name) {
      const duplicateSubscription = await Subscription.findOne({ name });
      if (duplicateSubscription) {
        return res.status(400).json({ message: 'Another subscription with this name already exists.' });
      }
    }

    existingSubscription.name = name;
    existingSubscription.description = description;
    existingSubscription.priceMonthly = priceMonthly;
    existingSubscription.priceYearly = priceYearly;
    existingSubscription.features = features;
    existingSubscription.modules = modules;
    existingSubscription.isActive = isActive;
    const updatedSubscription = await existingSubscription.save();

    res.status(200).json({ message: 'Subscription updated successfully', subscription: updatedSubscription });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ message: 'Error updating subscription' });
  }
};

// Delete subscriptions
export const deleteSubscriptions = async (req, res) => {
  const { subIds } = req.body;

  try {
    await Subscription.deleteMany({ _id: { $in: subIds } });
    res.status(200).json({ message: 'Subscriptions deleted successfully' });
  } catch (error) {
    console.error('Error deleting subscriptions:', error);
    res.status(500).json({ message: 'Error deleting subscriptions' });
  }
};