// server/src/controllers/trainingPathController.js
import TrainingPath from '../models/TrainingPath.js';
import Organization from '../models/Organization.js';
import Subscription from '../models/Subscription.js'; // Ensure this model exists

// Create a global training path (for superadmin)
export const createTrainingPath = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // If user is superadmin => create global (organization_id = null).
    // If user is admin => create local (organization_id = req.user.org).
    const isSuperadmin = req.user.role.toLowerCase() === 'superadmin';

    let organization_id = null;
    if (!isSuperadmin) {
      // local admin -> use the user's org
      organization_id = req.user.org;
    }

    // Destructure common fields
    const { name, description, role_ids, subjectMappings } = req.body;
    let subscription = req.body.subscription;

    // If subscription is an ObjectId (24 char) => convert to name
    if (subscription && subscription.length === 24) {
      const subObj = await Subscription.findById(subscription);
      if (subObj) {
        subscription = subObj.name;
      }
    }

    const roleArray = Array.isArray(role_ids) ? role_ids : [];
    const subjectMap = Array.isArray(subjectMappings) ? subjectMappings : [];

    const newPath = new TrainingPath({
      subscription,
      name,
      description,
      role_ids: roleArray,
      subjectMappings: subjectMap,
      addedBy: req.user.email || 'Unknown',
      organization_id,
      parentTrainingPath: null
    });

    const savedPath = await newPath.save();
    await savedPath.populate('role_ids');
    await savedPath.populate('subjectMappings.subject_id');
    return res.status(201).json(savedPath);
  } catch (error) {
    console.error('Error creating training path:', error);
    // If it's a duplicate key error, return a 400 with friendlier message
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: 'A training path with the same name already exists.' });
    }
    return res.status(500).json({ message: 'Error creating training path', error: error.message });
  }
};

// Update a training path
export const updateTrainingPath = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    const isSuperadmin = req.user.role.toLowerCase() === 'superadmin';

    const { id } = req.params;
    const existingPath = await TrainingPath.findById(id);
    if (!existingPath) {
      return res.status(404).json({ message: 'Training path not found.' });
    }

    // If user is local admin, only allow update if the path is local for their org
    if (!isSuperadmin) {
      if (!existingPath.organization_id) {
        // i.e. global path => local admin is not allowed to edit
        return res.status(403).json({ message: 'Not authorized to edit global training path.' });
      }
      // Also check if same org
      if (existingPath.organization_id.toString() !== req.user.org.toString()) {
        return res.status(403).json({ message: 'Not authorized to edit this path.' });
      }
    }

    const { name, description, role_ids, subjectMappings } = req.body;
    let subscription = req.body.subscription;

    // Possibly convert subscription id => name
    if (subscription && subscription.length === 24) {
      const subObj = await Subscription.findById(subscription);
      if (subObj) {
        subscription = subObj.name;
      }
    }

    existingPath.name = name;
    existingPath.description = description;
    existingPath.subscription = subscription || existingPath.subscription;
    existingPath.role_ids = Array.isArray(role_ids) ? role_ids : [];
    existingPath.subjectMappings = Array.isArray(subjectMappings) ? subjectMappings : [];

    const updated = await existingPath.save();
    await updated.populate('role_ids');
    await updated.populate('subjectMappings.subject_id');
    return res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating training path:', error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: 'A training path with the same name already exists.' });
    }
    return res.status(500).json({ message: 'Error updating training path', error: error.message });
  }
};

// Delete a training path
export const deleteTrainingPath = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    const isSuperadmin = req.user.role.toLowerCase() === 'superadmin';
    const { id } = req.params;
    const existingPath = await TrainingPath.findById(id);
    if (!existingPath) {
      return res.status(404).json({ message: 'Training path not found.' });
    }

    // Local admin can't delete a global training path
    if (!isSuperadmin && !existingPath.organization_id) {
      return res.status(403).json({ message: 'Not authorized to delete global training path.' });
    }
    // Also check same org if local
    if (!isSuperadmin && existingPath.organization_id) {
      if (existingPath.organization_id.toString() !== req.user.org.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this path.' });
      }
    }

    await existingPath.deleteOne();
    return res.status(200).json({ message: 'Training path deleted successfully.' });
  } catch (error) {
    console.error('Error deleting training path:', error);
    return res.status(500).json({ message: 'Error deleting training path', error: error.message });
  }
};

// Get global training paths (superadmin only).
// (But we actually fetch them from the route with isSuperAdmin guard or admin guard)
export const getTrainingPaths = async (req, res) => {
  try {
    // If user is superadmin => fetch all (global + local).
    // If user is admin => fetch global + local for that user org.
    if (!req.user) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    const isSuperadmin = req.user.role.toLowerCase() === 'superadmin';

    let query;
    if (isSuperadmin) {
      // superadmin => everything
      query = {};
    } else {
      // admin => global or same org
      query = {
        $or: [
          { organization_id: null },
          { organization_id: req.user.org }
        ]
      };
    }

    const trainingPaths = await TrainingPath.find(query)
      .populate('role_ids')
      .populate('subjectMappings.subject_id');
    return res.status(200).json(trainingPaths);
  } catch (error) {
    console.error('Error fetching training paths:', error);
    return res.status(500).json({ message: 'Error fetching training paths', error: error.message });
  }
};

export default {
  createTrainingPath,
  updateTrainingPath,
  deleteTrainingPath,
  getTrainingPaths
};