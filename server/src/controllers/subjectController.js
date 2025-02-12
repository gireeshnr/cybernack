import Subject from '../models/Subject.js';
import logger from '../util/logger.js'; // If you're using your custom logger

// Create a subject
export const createSubject = async (req, res) => {
  try {
    const subject = new Subject(req.body);
    const savedSubject = await subject.save();

    // If you want to populate domain_id & subscription_id
    await savedSubject.populate('domain_id');
    await savedSubject.populate('subscription_id');

    return res.status(201).json(savedSubject);
  } catch (error) {
    console.error('Error creating subject:', error.stack || error);
    logger.error(`Error creating subject: ${error.message}\nStack: ${error.stack}`);

    return res.status(500).json({
      message: 'Error creating subject',
      error: error.message,
    });
  }
};

// Get all subjects
export const getSubjects = async (req, res) => {
  try {
    // Populate domain_id & subscription_id if needed
    const subjects = await Subject.find()
      .populate('domain_id')
      .populate('subscription_id');

    return res.status(200).json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error.stack || error);
    logger.error(`Error fetching subjects: ${error.message}\nStack: ${error.stack}`);

    return res.status(500).json({
      message: 'Error fetching subjects',
      error: error.message,
    });
  }
};

// Update a subject
export const updateSubject = async (req, res) => {
  try {
    const updatedSubject = await Subject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate('domain_id')
      .populate('subscription_id');

    if (!updatedSubject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    return res.status(200).json(updatedSubject);
  } catch (error) {
    console.error('Error updating subject:', error.stack || error);
    logger.error(`Error updating subject: ${error.message}\nStack: ${error.stack}`);

    return res.status(500).json({
      message: 'Error updating subject',
      error: error.message,
    });
  }
};

// Delete a subject
export const deleteSubject = async (req, res) => {
  try {
    const deletedSubject = await Subject.findByIdAndDelete(req.params.id);
    if (!deletedSubject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    return res.status(200).json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error.stack || error);
    logger.error(`Error deleting subject: ${error.message}\nStack: ${error.stack}`);

    return res.status(500).json({
      message: 'Error deleting subject',
      error: error.message,
    });
  }
};
