// server/src/controllers/domainController.js
import Domain from '../models/Domain.js';
import logger from '../util/logger.js';

export const createDomain = async (req, res) => {
  try {
    const domain = new Domain(req.body);
    const savedDomain = await domain.save();
    await savedDomain.populate('industries').populate('subscription_id');
    return res.status(201).json(savedDomain);
  } catch (error) {
    console.error('Error creating domain:', error.stack || error);
    logger.error(`Error creating domain: ${error.message}\nStack: ${error.stack}`);
    return res.status(500).json({ message: 'Error creating domain', error: error.message });
  }
};

export const getDomains = async (req, res) => {
  try {
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
    return res.status(500).json({ message: 'Error fetching domains', error: error.message });
  }
};

export const updateDomain = async (req, res) => {
  try {
    const updatedDomain = await Domain.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('industries')
      .populate('subscription_id');
    if (!updatedDomain) {
      return res.status(404).json({ message: 'Domain not found' });
    }
    return res.status(200).json(updatedDomain);
  } catch (error) {
    console.error('Error updating domain:', error.stack || error);
    logger.error(`Error updating domain: ${error.message}\nStack: ${error.stack}`);
    return res.status(500).json({ message: 'Error updating domain', error: error.message });
  }
};

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
    return res.status(500).json({ message: 'Error deleting domain', error: error.message });
  }
};