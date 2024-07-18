import Organization from '../models/Organization.js';

export const getRootDomain = async (req, res) => {
  try {
    const userOrgId = req.user.org; // Assuming `req.user.org` contains the organization ID
    const organization = await Organization.findById(userOrgId);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.json({ "Root Domain": organization['Root Domain'] });
  } catch (error) {
    console.error('Error fetching root domain:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
