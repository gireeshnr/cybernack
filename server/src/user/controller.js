import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Organization from '../models/Organization.js';

export default {
  // Get user profile
  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).populate('org', 'name').exec();
      if (!user) {
        return res.status(404).send('User not found');
      }
      res.send({
        email: user.email,
        name: user.name,
        role: user.role,
        org: user.org ? user.org.name : null,
        phone: user.phone,
        emailVerified: user.emailVerified,
      });
    } catch (err) {
      res.status(500).send('Internal server error');
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).exec();
      if (!user) {
        return res.status(404).send('User not found');
      }
      user.name.first = req.body.firstName;
      user.name.last = req.body.lastName;
      const updatedUser = await user.save();
      res.send(updatedUser);
    } catch (err) {
      res.status(500).send('Internal Server Error');
    }
  },

  // Fetch all users with populated organization names
  getUsers: async (req, res) => {
    try {
      const query = req.user.role === 'superadmin' ? {} : { org: req.user.org };
      const users = await User.find(query)
        .populate('org', 'name') // Populate organization name
        .select('name email role org isActive')
        .exec();
      if (!users || users.length === 0) {
        return res.status(404).json({ message: 'No users found' });
      }
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching users' });
    }
  },

  // Fetch a specific organization by ID
  getOrganizationById: async (req, res) => {
    try {
      const organization = await Organization.findById(req.params.orgId).exec();
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }
      res.status(200).json(organization);
    } catch (err) {
      res.status(500).json({ error: 'Error fetching organization' });
    }
  },

  // Add a new user to an organization
  addUser: async (req, res) => {
    const { firstName, lastName, email, role = 'user', password } = req.body;
    try {
      // Check if a user with the same email already exists in the organization
      const existingUser = await User.findOne({ email, org: req.user.org });
      if (existingUser) {
        return res.status(400).json({ error: 'A user with this email already exists in your organization.' });
      }

      // Fetch the organization to ensure it exists
      const organization = await Organization.findById(req.user.org);
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found.' });
      }

      // Create the new user
      const newUser = new User({
        name: { first: firstName, last: lastName },
        email,
        role,
        org: req.user.org, // Assign the user to the admin's organization
        isActive: true,
        password,
      });

      // Save the new user
      await newUser.save();
      res.status(201).json({ message: 'User added successfully and activated.', user: newUser });
    } catch (error) {
      console.error('Error adding user:', error); // Debug log
      res.status(500).json({ error: 'Server error while adding user. Please try again later.' });
    }
  },

  // Update a user’s details and active status
  updateUser: async (req, res) => {
    const { firstName, lastName, role, isActive } = req.body; // Include isActive here
    const { userId } = req.params;

    try {
      const user = await User.findOne({
        _id: userId,
        ...(req.user.role !== 'superadmin' && { org: req.user.org }),
      });
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
      user.name.first = firstName;
      user.name.last = lastName;
      user.role = role;
      if (typeof isActive === 'boolean') user.isActive = isActive; // Update active status if provided

      const updatedUser = await user.save();
      res.status(200).json({ message: 'User updated successfully.', user: updatedUser });
    } catch (error) {
      res.status(500).json({ error: 'Error while updating user. Please try again later.' });
    }
  },

  // Delete multiple users by IDs
  deleteUsers: async (req, res) => {
    const { userIds } = req.body;
    try {
      // Filter out the logged-in user's ID
      const filteredUserIds = userIds.filter((id) => id !== req.user.id);

      if (filteredUserIds.length === 0) {
        return res.status(400).json({ error: 'You cannot delete your own account.' });
      }

      const query = {
        _id: { $in: filteredUserIds },
        ...(req.user.role !== 'superadmin' && { org: req.user.org }),
      };
      const result = await User.deleteMany(query);
      if (result.deletedCount === 0) {
        return res.status(400).json({ error: 'No users were deleted. Please check the user IDs.' });
      }
      res.status(200).json({ message: `${result.deletedCount} users deleted successfully.` });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting users. Please try again later.' });
    }
  },
};