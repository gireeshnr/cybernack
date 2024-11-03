import Organization from '../models/organization.js';
import User from '../models/user.js';

// Fetch organization by ID
export const getOrganizationById = async (req, res) => {
  const orgId = req.params.orgId;
  try {
    const organization = await Organization.findById(orgId);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    res.json({ name: organization.name });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Fetch all organizations (including Cybernack if superadmin)
export const getAllOrganizations = async (req, res) => {
  try {
    const query = req.user.role === 'superadmin' ? {} : { name: { $ne: 'Cybernack' } };
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
    res.status(500).json({ message: 'Server error fetching organizations' });
  }
};

// Create a new organization
export const createOrganization = async (req, res) => {
  const { orgName, subscription } = req.body; // Ensure subscription is included
  try {
    // Check if the organization name already exists
    const existingOrg = await Organization.findOne({ name: orgName });
    if (existingOrg) {
      return res.status(400).json({ message: 'Organization already exists.' });
    }

    // Check that subscription ID is provided
    if (!subscription) {
      return res.status(400).json({ message: 'Subscription is required.' });
    }

    // Create a new organization
    const newOrg = new Organization({
      name: orgName,
      subscription,       // Make sure this is passed from the request body
      createdAt: new Date(),
      isActive: true,
    });

    const savedOrg = await newOrg.save();
    res.status(201).json({ message: 'Organization created successfully.', organization: savedOrg });
  } catch (error) {
    console.error('Error creating organization:', error); // Log full error details
    res.status(500).json({ message: 'Error creating organization. Try again later.' });
  }
};

// Update organization details
export const updateOrganization = async (req, res) => {
  const { orgId, name, isActive, subscription } = req.body;
  try {
    const organization = await Organization.findById(orgId);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    if (name) organization.name = name;
    if (typeof isActive === 'boolean') organization.isActive = isActive;
    if (subscription) organization.subscription = subscription;

    const updatedOrganization = await organization.save();
    res.status(200).json({ message: 'Organization updated successfully', organization: updatedOrganization });
  } catch (error) {
    res.status(500).json({ message: 'Error updating organization. Try again later.' });
  }
};

// Delete a single organization and its users
export const deleteOrganization = async (req, res) => {
  const { orgId } = req.params;
  try {
    const organization = await Organization.findById(orgId);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    await Organization.findByIdAndDelete(orgId);
    await User.deleteMany({ org: orgId });
    res.status(200).json({ message: 'Organization and users deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting organization. Try again later.' });
  }
};

// Delete multiple organizations and their users
export const deleteOrganizations = async (req, res) => {
  const { orgIds } = req.body;
  try {
    await Organization.deleteMany({ _id: { $in: orgIds } });
    await User.deleteMany({ org: { $in: orgIds } });
    res.status(200).json({ message: 'Organizations and users deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting organizations. Try again later.' });
  }
};