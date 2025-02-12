import Organization from '../models/Organization.js';
import User from '../models/user.js';
import Subscription from '../models/Subscription.js';

/******************
 * Existing Code
 ******************/

// Fetch organization by ID
export const getOrganizationById = async (req, res) => {
  const orgId = req.params.orgId;
  try {
    const organization = await Organization.findById(orgId);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    res.json(organization);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Fetch all organizations
export const getAllOrganizations = async (req, res) => {
  try {
    const query = req.user.role === 'superadmin'
      ? {}
      : { name: { $ne: 'Cybernack' } };
    const organizations = await Organization.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'org',
          as: 'users',
        },
      },
      {
        $addFields: {
          numberOfUsers: { $size: '$users' },
        },
      },
    ]);
    res.json(organizations);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Server error fetching organizations' });
  }
};

// Create a new organization
export const createOrganization = async (req, res) => {
  const {
    orgName,
    subscription,
    billingTerm,
    subscriptionStartDate,
    subscriptionEndDate,
  } = req.body;

  const trimmedName = orgName.trim();

  try {
    const existingOrg = await Organization.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
    });
    if (existingOrg) {
      return res.status(400).json({ message: 'Organization already exists.' });
    }

    if (!subscription) {
      return res
        .status(400)
        .json({ message: 'Subscription is required.' });
    }

    const newOrg = new Organization({
      name: trimmedName,
      subscription,
      createdAt: new Date(),
      isActive: true,
      billingTerm: billingTerm || '',
      subscriptionStartDate: subscriptionStartDate
        ? new Date(subscriptionStartDate)
        : new Date(),
      subscriptionEndDate: subscriptionEndDate
        ? new Date(subscriptionEndDate)
        : null,
    });

    const savedOrg = await newOrg.save();
    res.status(201).json({
      message: 'Organization created successfully.',
      organization: savedOrg,
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    res
      .status(500)
      .json({ message: 'Error creating organization. Try again later.' });
  }
};

// Update organization details
export const updateOrganization = async (req, res) => {
  console.log('---[SERVER] updateOrganization called---');
  console.log('Request body:', req.body);

  try {
    const {
      orgId,
      name,
      isActive,
      subscription,
      billingTerm,
      subscriptionStartDate,
      subscriptionEndDate,
    } = req.body;

    // Find the organization
    const organization = await Organization.findById(orgId);
    if (!organization) {
      console.log('Organization not found for ID:', orgId);
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Log what we found
    console.log('Current organization data:', organization);

    // Overwrite fields if provided
    if (typeof name === 'string') {
      organization.name = name.trim();
    }
    if (typeof isActive === 'boolean') {
      organization.isActive = isActive;
    }
    if (subscription) {
      organization.subscription = subscription;
    }

    // BillingTerm, StartDate, EndDate
    if (billingTerm !== undefined) {
      organization.billingTerm = billingTerm;
    }
    if (subscriptionStartDate !== undefined) {
      if (subscriptionStartDate) {
        organization.subscriptionStartDate = new Date(subscriptionStartDate);
      } else {
        organization.subscriptionStartDate = null;
      }
    }
    if (subscriptionEndDate !== undefined) {
      if (subscriptionEndDate) {
        organization.subscriptionEndDate = new Date(subscriptionEndDate);
      } else {
        organization.subscriptionEndDate = null;
      }
    }

    console.log('Saving updated organization...');
    const updatedOrganization = await organization.save();

    console.log('---[SERVER] Updated org---\n', updatedOrganization);

    return res.status(200).json({
      message: 'Organization updated successfully',
      organization: updatedOrganization,
    });
  } catch (error) {
    console.error('Error updating organization:', error);
    return res
      .status(500)
      .json({ message: 'Error updating organization. Try again later.' });
  }
};

/***********************
 * ADD SINGLE DELETE
 ***********************/
export const deleteOrganization = async (req, res) => {
  try {
    const { orgId } = req.params;

    const org = await Organization.findById(orgId);
    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Remove the org
    await Organization.findByIdAndDelete(orgId);
    // Remove all users under that org
    await User.deleteMany({ org: orgId });

    res.status(200).json({ message: 'Organization deleted successfully' });
  } catch (error) {
    console.error('Error deleting organization:', error);
    res
      .status(500)
      .json({ message: 'Error deleting organization. Try again later.' });
  }
};

// Delete multiple organizations
export const deleteOrganizations = async (req, res) => {
  const { orgIds } = req.body;
  try {
    await Organization.deleteMany({ _id: { $in: orgIds } });
    await User.deleteMany({ org: { $in: orgIds } });
    res
      .status(200)
      .json({ message: 'Organizations and users deleted successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error deleting organizations. Try again later.' });
  }
};

/******************
 * UPGRADE & CANCEL
 ******************/
export const upgradeSubscription = async (req, res) => {
  try {
    const { orgId, newSubscriptionId, term } = req.body;
    if (!orgId || !newSubscriptionId) {
      return res
        .status(400)
        .json({ message: 'Missing orgId or newSubscriptionId' });
    }

    const organization = await Organization.findById(orgId);
    if (!organization) {
      return res
        .status(404)
        .json({ message: 'Organization not found' });
    }

    const newSub = await Subscription.findById(newSubscriptionId);
    if (!newSub) {
      return res
        .status(404)
        .json({ message: 'Subscription not found' });
    }

    organization.subscription = newSub._id;
    organization.subscriptionEndDate = null;
    organization.billingTerm = term || 'monthly';
    organization.subscriptionStartDate = new Date();

    await organization.save();
    res
      .status(200)
      .json({ message: 'Subscription upgraded successfully' });
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    res
      .status(500)
      .json({ message: 'Error upgrading subscription' });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const { orgId } = req.body;
    if (!orgId) {
      return res
        .status(400)
        .json({ message: 'Missing orgId' });
    }

    const organization = await Organization.findById(orgId).populate('subscription');
    if (!organization) {
      return res
        .status(404)
        .json({ message: 'Organization not found' });
    }

    const currentName = organization.subscription.name.toLowerCase();
    if (currentName.includes('free')) {
      return res.status(400).json({
        message: 'Already on Free tier; no cancellation needed.',
      });
    }

    let daysToAdd = 30;
    if (currentName.includes('enterprise') || currentName.includes('annual')) {
      daysToAdd = 365;
    }

    const endDate = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);
    organization.subscriptionEndDate = endDate;

    await organization.save();
    res.status(200).json({
      message: `Subscription will end on ${endDate.toDateString()}. After that, you'll revert to Free.`,
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res
      .status(500)
      .json({ message: 'Error canceling subscription' });
  }
};