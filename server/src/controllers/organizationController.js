import Organization from '../models/Organization.js';

export const getRootDomain = async (req, res) => {
  try {
    const userOrgId = req.user.org;
    console.log(`Fetching root domain for organization ID: ${userOrgId}`);
    
    const organization = await Organization.findById(userOrgId);
    if (!organization) {
      console.error('Organization not found');
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.json({ rootDomain: organization.rootDomain });
  } catch (error) {
    console.error('Error fetching root domain:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
