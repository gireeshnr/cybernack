// server/src/controllers/industryController.js
import Industry from '../models/Industry.js';

/**
 * Normalize a subscription name (e.g. ' Standard ' => 'standard').
 */
function normalizeSubName(rawName) {
  if (!rawName) return '';
  return rawName.trim().toLowerCase();
}

/**
 * Return numeric "levels" for subscription names:
 *   Free => 1, Standard => 2, Enterprise => 3
 *   anything else => 0
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
 * GET /industry
 * Returns industries based on the logged‐in user’s role (global vs. local)
 * and filters local records based on the organization’s subscription level.
 */
export const getIndustries = async (req, res) => {
  try {
    // The req.user.organization is already populated (via authMiddleware)
    const { role, organization } = req.user;
    const creatorRole = role; // already lowercased in authMiddleware

    // Build base query for global vs. local records.
    let query = {};
    if (creatorRole !== 'superadmin') {
      // Local admins see:
      // – Global records (creatorRole === 'superadmin')
      // – Their own local records (creatorRole === 'admin' and ownerOrgId matches)
      query = {
        $or: [
          { creatorRole: 'superadmin' },
          { creatorRole: 'admin', ownerOrgId: organization._id },
        ],
      };
    }

    // Fetch industries sorted by createdAt descending and populate subscription info.
    let industries = await Industry.find(query)
      .sort({ createdAt: -1 })
      .populate('subscription_id')
      .lean();

    // For non‑superadmin users, filter out records whose subscription level is higher
    // than the organization's current subscription.
    if (creatorRole !== 'superadmin') {
      const orgSubscriptionName = organization.subscription?.name || 'Free';
      const orgSubLevel = getSubLevel(orgSubscriptionName);

      industries = industries.filter((ind) => {
        const recSubName = ind.subscription_id?.name || 'Free';
        const recLevel = getSubLevel(recSubName);
        return recLevel <= orgSubLevel;
      });
    }

    return res.status(200).json(industries);
  } catch (err) {
    console.error('Error fetching industries:', err);
    return res.status(500).json({
      message: 'Error fetching industries',
      error: err.message,
    });
  }
};

/**
 * POST /industry
 * Create a new industry.
 * • For superadmin: global record (ownerOrgId = null) and subscription_id is taken as submitted.
 * • For admin: local record (ownerOrgId = organization._id) and subscription_id is set
 *   to the organization’s current subscription.
 * Also sets creatorRole based on the logged‑in user.
 */
export const createIndustry = async (req, res) => {
  try {
    const { role, organization, email } = req.user;
    const creatorRole = role; // already lowercased
    const ownerOrgId = creatorRole === 'superadmin' ? null : organization._id;

    const { name, description, subscription_id } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Industry name is required.' });
    }

    // For local admins, override any submitted subscription with the organization's subscription.
    const finalSubscriptionId = creatorRole === 'superadmin' ? subscription_id : organization.subscription._id;

    const newIndustry = new Industry({
      name,
      description: description || '',
      subscription_id: finalSubscriptionId,
      ownerOrgId,
      addedBy: email || '',
      creatorRole, // 'superadmin' or 'admin'
    });

    const savedIndustry = await newIndustry.save();
    return res.status(201).json(savedIndustry);
  } catch (err) {
    console.error('Error creating industry:', err);
    return res.status(500).json({
      message: 'Error creating industry',
      error: err.message,
    });
  }
};

/**
 * PUT /industry/:id
 * Update an existing industry.
 * For local admins, the subscription is overridden with the organization's subscription.
 */
export const updateIndustry = async (req, res) => {
  try {
    const { role, organization } = req.user;
    const creatorRole = role; // already lowercased
    const { name, description, subscription_id } = req.body;
    const finalSubscriptionId = creatorRole === 'superadmin' ? subscription_id : organization.subscription._id;
    const updatedIndustry = await Industry.findByIdAndUpdate(
      req.params.id,
      { name, description: description || '', subscription_id: finalSubscriptionId },
      { new: true, runValidators: true }
    ).populate('subscription_id');

    if (!updatedIndustry) {
      return res.status(404).json({ message: 'Industry not found' });
    }
    return res.status(200).json(updatedIndustry);
  } catch (err) {
    console.error('Error updating industry:', err);
    return res.status(500).json({
      message: 'Error updating industry',
      error: err.message,
    });
  }
};

/**
 * DELETE /industry/:id
 */
export const deleteIndustry = async (req, res) => {
  try {
    const deletedIndustry = await Industry.findByIdAndDelete(req.params.id);
    if (!deletedIndustry) {
      return res.status(404).json({ message: 'Industry not found' });
    }
    return res.status(200).json({ message: 'Industry deleted successfully' });
  } catch (err) {
    console.error('Error deleting industry:', err);
    return res.status(500).json({
      message: 'Error deleting industry',
      error: err.message,
    });
  }
};

export default {
  getIndustries,
  createIndustry,
  updateIndustry,
  deleteIndustry,
};