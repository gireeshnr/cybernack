import Domain from '../models/Domain.js';
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
 * GET /domain
 * Returns Domain records filtered by:
 *   1. The creatorRole:
 *      - Global records: creatorRole === 'superadmin'
 *      - Local records: creatorRole === 'admin' and ownerOrgId matches
 *   2. For non‑superadmin users, further filter records based on subscription level.
 */
export const getDomains = async (req, res) => {
  try {
    const { role, org } = req.user;
    const creatorRole = role; // already lowercased by auth middleware

    // Build base query for global vs. local records.
    let query = {};
    if (creatorRole !== 'superadmin') {
      query = {
        $or: [
          { creatorRole: 'superadmin' },
          { creatorRole: 'admin', ownerOrgId: org },
        ],
      };
    }

    // Fetch domains with subscription and industry populated.
    let domains = await Domain.find(query)
      .sort({ createdAt: -1 })
      .populate('subscription_id')
      .populate('industry_id')
      .lean();

    // For non‑superadmin users, filter records based on subscription level.
    if (creatorRole !== 'superadmin') {
      const orgSubscriptionName = req.user.organization.subscription?.name || 'Free';
      const orgSubLevel = getSubLevel(orgSubscriptionName);

      domains = domains.filter((d) => {
        const recSubName = d.subscription_id?.name || 'Free';
        const recLevel = getSubLevel(recSubName);
        return recLevel <= orgSubLevel;
      });
    }

    return res.status(200).json(domains);
  } catch (err) {
    console.error('Error fetching domains:', err);
    return res.status(500).json({
      message: 'Error fetching domains',
      error: err.message,
    });
  }
};

/**
 * POST /domain
 * Create a new Domain.
 * For superadmin (global): ownerOrgId = null.
 * For admin (local): ownerOrgId = user's organization.
 * Also sets creatorRole based on the logged‑in user.
 * For non‑superadmin users, the subscription is forced to the organization’s current subscription.
 */
export const createDomain = async (req, res) => {
  try {
    const { role, org, email, organization } = req.user;
    const ownerOrgId = role === 'superadmin' ? null : org;
    const { name, description, subscription_id, industry_id } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Domain name is required.' });
    }
    if (!industry_id) {
      return res.status(400).json({ message: 'Industry is required.' });
    }

    const finalSubscriptionId = role === 'superadmin' ? subscription_id : organization.subscription._id;

    const newDomain = new Domain({
      name,
      description: description || '',
      industry_id,
      subscription_id: finalSubscriptionId,
      ownerOrgId,
      addedBy: email || '',
      creatorRole: role,
    });

    const savedDomain = await newDomain.save();
    await savedDomain.populate('subscription_id');
    await savedDomain.populate('industry_id');
    return res.status(201).json(savedDomain);
  } catch (err) {
    console.error('Error creating domain:', err);
    if (err.code === 11000) {
      const duplicateField = Object.keys(err.keyValue)[0];
      const duplicateValue = err.keyValue[duplicateField];
      return res.status(400).json({ message: `A domain with ${duplicateField} "${duplicateValue}" already exists in your organization.` });
    }
    return res.status(500).json({ message: 'Error creating domain', error: err.message });
  }
};

/**
 * PUT /domain/:id
 * Update an existing Domain.
 * For non‑superadmin users, subscription_id is overridden with the organization’s current subscription.
 */
export const updateDomain = async (req, res) => {
  try {
    const { role, organization } = req.user;
    const { name, description, subscription_id, industry_id } = req.body;
    if (!industry_id) {
      return res.status(400).json({ message: 'Industry is required.' });
    }

    const finalSubscriptionId = role === 'superadmin' ? subscription_id : organization.subscription._id;

    const updatedDomain = await Domain.findByIdAndUpdate(
      req.params.id,
      { name, description: description || '', subscription_id: finalSubscriptionId, industry_id },
      { new: true, runValidators: true }
    )
      .populate('subscription_id')
      .populate('industry_id');

    if (!updatedDomain) {
      return res.status(404).json({ message: 'Domain not found' });
    }
    return res.status(200).json(updatedDomain);
  } catch (err) {
    console.error('Error updating domain:', err);
    if (err.code === 11000) {
      const duplicateField = Object.keys(err.keyValue)[0];
      const duplicateValue = err.keyValue[duplicateField];
      return res.status(400).json({ message: `A domain with ${duplicateField} "${duplicateValue}" already exists in your organization.` });
    }
    return res.status(500).json({ message: 'Error updating domain', error: err.message });
  }
};

/**
 * DELETE /domain/:id
 */
export const deleteDomain = async (req, res) => {
  try {
    const deletedDomain = await Domain.findByIdAndDelete(req.params.id);
    if (!deletedDomain) {
      return res.status(404).json({ message: 'Domain not found' });
    }
    return res.status(200).json({ message: 'Domain deleted successfully' });
  } catch (err) {
    console.error('Error deleting domain:', err);
    return res.status(500).json({ message: 'Error deleting domain', error: err.message });
  }
};

export default {
  getDomains,
  createDomain,
  updateDomain,
  deleteDomain,
};