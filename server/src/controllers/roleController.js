// server/src/controllers/roleController.js
import Role from '../models/Role.js';

export const getRoles = async (req, res) => {
  try {
    const { organization, role } = req.user; // Get organization and role from the authenticated user
    const organization_id = organization?._id; // Extract organization_id

    let query = {};
    if (role.toLowerCase() !== 'superadmin') {
      // For non-superadmins, fetch only global roles and local roles for their organization
      query = {
        $or: [
          { organization_id: null }, // Global roles
          { organization_id }, // Local roles for the organization
        ],
      };
    }
    // For superadmins, fetch all roles

    const roles = await Role.find(query).populate('subjects');
    console.log('Roles fetched:', roles);
    return res.status(200).json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return res.status(500).json({ message: 'Error fetching roles', error: error.message });
  }
};

export const createRole = async (req, res) => {
  try {
    const { name, description, subjects, subscription, organization_id, addedBy } = req.body;
    const { organization_id: userOrgId, org } = req.user; // Get organization_id and org name from the authenticated user

    // Check if a role with the same name already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({ message: 'A role with the same name already exists.' });
    }

    const newRole = new Role({
      name,
      description,
      subjects,
      subscription, // Save the subscription field
      organization_id: organization_id || userOrgId, // Set organization_id for local roles
      addedBy: addedBy || org.name, // Set addedBy to the organization name for local roles
    });

    const savedRole = await newRole.save();
    await savedRole.populate('subjects');
    return res.status(201).json(savedRole);
  } catch (error) {
    console.error('Error creating role:', error);
    return res.status(500).json({ message: 'Error creating role', error: error.message });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { name, description, subjects, subscription } = req.body;
    const updatedRole = await Role.findByIdAndUpdate(
      req.params.id,
      { name, description, subjects, subscription },
      { new: true, runValidators: true }
    ).populate('subjects');

    if (!updatedRole) {
      return res.status(404).json({ message: 'Role not found' });
    }
    return res.status(200).json(updatedRole);
  } catch (error) {
    console.error('Error updating role:', error);
    return res.status(500).json({ message: 'Error updating role', error: error.message });
  }
};

export const deleteRole = async (req, res) => {
  try {
    const deletedRole = await Role.findByIdAndDelete(req.params.id);
    if (!deletedRole) {
      return res.status(404).json({ message: 'Role not found' });
    }
    return res.status(200).json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error);
    return res.status(500).json({ message: 'Error deleting role', error: error.message });
  }
};

export default {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
};