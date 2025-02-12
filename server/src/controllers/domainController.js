import Domain from '../models/Domain.js';
import logger from '../util/logger.js'; // Adjust import if your logger is located elsewhere

// Create a domain
export const createDomain = async (req, res) => {
  try {
    const domain = new Domain(req.body);
    const savedDomain = await domain.save();

    // Populate 'industries' in one step
    await savedDomain.populate('industries');
    // Populate 'subscription_id' in another step
    await savedDomain.populate('subscription_id');

    // Now 'savedDomain' has both 'industries' and 'subscription_id' populated
    return res.status(201).json(savedDomain);
  } catch (error) {
    console.error('Error creating domain:', error.stack || error);
    logger.error(`Error creating domain: ${error.message}\nStack: ${error.stack}`);

    return res.status(500).json({
      message: 'Error creating domain',
      error: error.message,
    });
  }
};

// Get all domains
export const getDomains = async (req, res) => {
  try {
    // Populate both 'industries' and 'subscription_id'
    const domains = await Domain.find()
      .populate('industries')
      .populate('subscription_id');

    if (!domains.length) {
      return res.status(200).json([]);
    }
    return res.status(200).json(domains);
  } catch (error) {
    console.error('Error fetching domains:', error.stack || error);
    logger.error(`Error fetching domains: ${error.message}\nStack: ${error.stack}`);

    return res.status(500).json({
      message: 'Error fetching domains',
      error: error.message,
    });
  }
};

// Update a domain
export const updateDomain = async (req, res) => {
  try {
    // If req.body.industries is an array of IDs, it replaces the current array
    const updatedDomain = await Domain.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate('industries')
      .populate('subscription_id');

    if (!updatedDomain) {
      return res.status(404).json({ message: 'Domain not found' });
    }

    return res.status(200).json(updatedDomain);
  } catch (error) {
    console.error('Error updating domain:', error.stack || error);
    logger.error(`Error updating domain: ${error.message}\nStack: ${error.stack}`);

    return res.status(500).json({
      message: 'Error updating domain',
      error: error.message,
    });
  }
};

// Delete a domain
export const deleteDomain = async (req, res) => {
  try {
    const deletedDomain = await Domain.findByIdAndDelete(req.params.id);
    if (!deletedDomain) {
      return res.status(404).json({ message: 'Domain not found' });
    }
    return res.status(200).json({ message: 'Domain deleted successfully' });
  } catch (error) {
    console.error('Error deleting domain:', error.stack || error);
    logger.error(`Error deleting domain: ${error.message}\nStack: ${error.stack}`);

    return res.status(500).json({
      message: 'Error deleting domain',
      error: error.message,
    });
  }
};
