import Industry from '../models/Industry.js';

// Create Industry
export const createIndustry = async (req, res) => {
  try {
    // req.body may include { name, description, subscription_id }
    const industry = new Industry(req.body);
    const savedIndustry = await industry.save();
    // Populate subscription for the response
    const populated = await savedIndustry.populate('subscription_id');
    return res.status(201).json(populated);
  } catch (error) {
    return res.status(500).json({
      message: 'Error creating industry',
      error: error.message,
    });
  }
};

// Get all Industries
export const getIndustries = async (req, res) => {
  try {
    // Populate subscription_id so we see subscription details
    const industries = await Industry.find().populate('subscription_id');
    return res.status(200).json(industries);
  } catch (error) {
    return res.status(500).json({
      message: 'Error fetching industries',
      error: error.message,
    });
  }
};

// Update Industry
export const updateIndustry = async (req, res) => {
  try {
    // If req.body includes subscription_id, it updates as well
    const updatedIndustry = await Industry.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('subscription_id');

    if (!updatedIndustry) {
      return res.status(404).json({ message: 'Industry not found' });
    }
    return res.status(200).json(updatedIndustry);
  } catch (error) {
    return res.status(500).json({
      message: 'Error updating industry',
      error: error.message,
    });
  }
};

// Delete Industry
export const deleteIndustry = async (req, res) => {
  try {
    const deletedIndustry = await Industry.findByIdAndDelete(req.params.id);
    if (!deletedIndustry) {
      return res.status(404).json({ message: 'Industry not found' });
    }
    return res.status(200).json({ message: 'Industry deleted successfully' });
  } catch (error) {
    return res.status(500).json({
      message: 'Error deleting industry',
      error: error.message,
    });
  }
};
