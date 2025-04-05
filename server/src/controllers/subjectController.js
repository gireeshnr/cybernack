import Subject from '../models/Subject.js';
import Domain from '../models/Domain.js';

/**
 * Normalize a subscription name (e.g. ' Standard ' => 'standard').
 */
function normalizeSubName(rawName) {
  if (!rawName) return '';
  return rawName.trim().toLowerCase();
}

/**
 * Return numeric levels for subscription names:
 *   Free => 1, Standard => 2, Enterprise => 3,
 *   anything else => 0.
 */
function getSubLevel(rawName) {
  const name = normalizeSubName(rawName);
  switch (name) {
    case 'free':
      return 1;
    case 'standard':
      return 2;
    case 'enterprise':
      return 3;
    default:
      return 0;
  }
}

/**
 * GET /subject
 * Return subjects filtered by:
 *  1. Global vs. local (based on creatorRole and ownerOrgId)
 *  2. For non‑superadmin users, only those records whose subscription level is less than or equal
 *     to the organization’s subscription.
 */
export const getSubjects = async (req, res) => {
  try {
    const { role, organization } = req.user;
    const creatorRole = role; // already lowercased by auth middleware

    let query = {};
    if (creatorRole !== 'superadmin') {
      // Local admin sees global subjects (created by superadmin) and local subjects (created by admin and ownerOrgId matching)
      query = {
        $or: [
          { creatorRole: 'superadmin' },
          { creatorRole: 'admin', ownerOrgId: organization._id },
        ],
      };
    }

    let subjects = await Subject.find(query)
      .sort({ createdAt: -1 })
      .populate('subscription_id') // so we can display the subscription name on the client
      .populate('domain_id')
      .lean();

    // For non‑superadmin users, further filter based on subscription level.
    if (creatorRole !== 'superadmin') {
      const orgSubscriptionName = organization.subscription?.name || 'Free';
      const orgSubLevel = getSubLevel(orgSubscriptionName);

      subjects = subjects.filter((sub) => {
        const recSubName = sub.subscription_id?.name || 'Free';
        const recLevel = getSubLevel(recSubName);
        return recLevel <= orgSubLevel;
      });
    }

    return res.status(200).json(subjects);
  } catch (err) {
    console.error('Error fetching subjects:', err);
    return res.status(500).json({ message: 'Error fetching subjects', error: err.message });
  }
};

/**
 * POST /subject
 * Create a new subject.
 * - For superadmin: global record (ownerOrgId = null) and the subscription must be provided.
 * - For admin: local record (ownerOrgId = organization._id) and the subscription is auto-assigned
 *   from the organization.
 *
 * Additionally, if a subscription is provided (by superadmin), then the selected domain must be mapped
 * to that subscription (i.e. the domain’s subscription_id must match the provided subscription_id).
 */
export const createSubject = async (req, res) => {
  try {
    const { role, organization, email } = req.user;
    const creatorRole = role; // already lowercased
    const ownerOrgId = creatorRole === 'superadmin' ? null : organization._id;
    let { name, description, subscription_id, domain_id } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Subject name is required.' });
    }
    if (!domain_id) {
      return res.status(400).json({ message: 'Domain is required.' });
    }

    // For superadmin, subscription_id is required.
    if (creatorRole === 'superadmin' && !subscription_id) {
      return res.status(400).json({ message: 'Subscription is required for global subjects.' });
    }

    // Verify that the selected domain exists and populate its subscription details.
    const domain = await Domain.findById(domain_id).populate('subscription_id');
    if (!domain) {
      return res.status(400).json({ message: 'Invalid domain selected.' });
    }

    if (creatorRole === 'superadmin') {
      // For superadmin, subscription_id must be provided and must match the domain's subscription
      if (!subscription_id) {
        return res.status(400).json({ message: 'Subscription is required for global subjects.' });
      }
      if (!domain.subscription_id) {
        return res.status(400).json({ message: 'Selected domain is not mapped to any subscription.' });
      }
      if (domain.subscription_id._id.toString() !== subscription_id.toString()) {
        return res.status(400).json({ message: 'Selected domain does not belong to the selected subscription.' });
      }
    } else {
      // For local admin, auto assign subscription from the domain and enforce matching with the organization's subscription
      if (!domain.subscription_id) {
        return res.status(400).json({ message: 'Selected domain is not mapped to any subscription.' });
      }
      if (organization.subscription && domain.subscription_id._id.toString() !== organization.subscription._id.toString()) {
        return res.status(400).json({ message: 'Selected domain does not belong to the organization’s subscription.' });
      }
      subscription_id = domain.subscription_id._id; // auto-assign
    }

    const newSubject = new Subject({
      name,
      description: description || '',
      domain_id,
      subscription_id: subscription_id || undefined,
      ownerOrgId,
      addedBy: email || '',
      creatorRole,
    });

    const savedSubject = await newSubject.save();
    await savedSubject.populate('subscription_id');
    await savedSubject.populate('domain_id');
    return res.status(201).json(savedSubject);
  } catch (err) {
    console.error('Error creating subject:', err);
    if (err.code === 11000) {
      const duplicateField = Object.keys(err.keyValue)[0];
      const duplicateValue = err.keyValue[duplicateField];
      return res.status(400).json({ message: `A subject with ${duplicateField} "${duplicateValue}" already exists in your organization.` });
    }
    return res.status(500).json({ message: 'Error creating subject', error: err.message });
  }
};

/**
 * PUT /subject/:id
 * Update an existing subject.
 * When a subscription is provided, the selected domain must belong to that subscription.
 */
export const updateSubject = async (req, res) => {
  try {
    const { role, organization } = req.user;
    const creatorRole = role; // already lowercased by auth middleware
    let { name, description, subscription_id, domain_id } = req.body;
    if (!domain_id) {
      return res.status(400).json({ message: 'Domain is required.' });
    }

    // Verify that the domain exists and get its subscription details.
    const domain = await Domain.findById(domain_id).populate('subscription_id');
    if (!domain) {
      return res.status(400).json({ message: 'Invalid domain selected.' });
    }
    if (creatorRole === 'superadmin') {
      if (subscription_id) {
        if (!domain.subscription_id) {
          return res.status(400).json({ message: 'Selected domain is not mapped to any subscription.' });
        }
        if (domain.subscription_id._id.toString() !== subscription_id.toString()) {
          return res.status(400).json({ message: 'Selected domain does not belong to the selected subscription.' });
        }
      }
    } else {
      // For local admin, auto assign subscription from the domain
      if (!domain.subscription_id) {
        return res.status(400).json({ message: 'Selected domain is not mapped to any subscription.' });
      }
      if (organization.subscription && domain.subscription_id._id.toString() !== organization.subscription._id.toString()) {
        return res.status(400).json({ message: 'Selected domain does not belong to the organization’s subscription.' });
      }
      subscription_id = domain.subscription_id._id;
    }

    const updatedSubject = await Subject.findByIdAndUpdate(
      req.params.id,
      { name, description: description || '', subscription_id, domain_id },
      { new: true, runValidators: true }
    )
      .populate('subscription_id')
      .populate('domain_id');

    if (!updatedSubject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    return res.status(200).json(updatedSubject);
  } catch (err) {
    console.error('Error updating subject:', err);
    if (err.code === 11000) {
      const duplicateField = Object.keys(err.keyValue)[0];
      const duplicateValue = err.keyValue[duplicateField];
      return res.status(400).json({ message: `A subject with ${duplicateField} "${duplicateValue}" already exists in your organization.` });
    }
    return res.status(500).json({ message: 'Error updating subject', error: err.message });
  }
};

/**
 * DELETE /subject/:id
 */
export const deleteSubject = async (req, res) => {
  try {
    const deletedSubject = await Subject.findByIdAndDelete(req.params.id);
    if (!deletedSubject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    return res.status(200).json({ message: 'Subject deleted successfully' });
  } catch (err) {
    console.error('Error deleting subject:', err);
    return res.status(500).json({ message: 'Error deleting subject', error: err.message });
  }
};

export default {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
};