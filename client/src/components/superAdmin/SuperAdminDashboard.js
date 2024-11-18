import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  getOrganizations,
  createOrganization,
  deleteOrganizations,
  updateOrganization,
  getSubscriptions,
} from '../../auth/actions';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa'; // Corrected import
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ConfirmModal from '../ConfirmModal';

const SuperAdminDashboard = ({
  getOrganizations,
  getSubscriptions,
  createOrganization,
  deleteOrganizations,
  updateOrganization,
  organizations,
  subscriptions,
}) => {
  const [organizationData, setOrganizationData] = useState({
    orgName: '',
    subscription: '',
    isActive: false,
  });
  const [selectedOrgs, setSelectedOrgs] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      await getOrganizations();
      await getSubscriptions();
    };
    fetchData();
  }, [getOrganizations, getSubscriptions]);

  const handleRowClick = (orgId) => {
    if (organizations.find((org) => org._id === orgId && org.name === 'Cybernack')) {
      return; // Skip selection for "Cybernack" organization
    }
    setSelectedOrgs((prevSelected) =>
      prevSelected.includes(orgId) ? prevSelected.filter((id) => id !== orgId) : [...prevSelected, orgId]
    );
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOrganizationData({
      ...organizationData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleAddOrganization = async (e) => {
    e.preventDefault();
    if (!organizationData.subscription) {
      toast.error('Please select a subscription.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createOrganization(organizationData);
      toast.success('New organization added successfully!');
      resetForm();
      await getOrganizations(); // Refresh organizations list after adding
      setShowAddForm(false);
    } catch (error) {
      toast.error('Error adding organization. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (org) => {
    if (org.name === 'Cybernack') {
      return; // Prevent editing for "Cybernack" organization
    }
    setOrganizationData({
      orgName: org.name,
      subscription: org.subscription?._id || org.subscription || '', // Ensures subscription ID is correctly set
      isActive: org.isActive || false,
    });
    setEditingOrg(org);
    setShowEditForm(true);
  };

  const handleUpdateOrganization = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateOrganization(editingOrg._id, organizationData);
      toast.success('Organization updated successfully!');
      resetForm();
      await getOrganizations(); // Refresh organizations list after updating
      setShowEditForm(false);
    } catch (error) {
      toast.error('Error updating organization. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteOrganizations(selectedOrgs);
      setSelectedOrgs([]);
      toast.success(`${selectedOrgs.length} organization(s) deleted successfully!`);
      await getOrganizations(); // Refresh organizations list after deletion
      setShowConfirmDelete(false);
    } catch (error) {
      toast.error('Error deleting organizations. Please try again.');
    }
  };

  const resetForm = () => {
    setOrganizationData({
      orgName: '',
      subscription: '',
      isActive: false,
    });
    setEditingOrg(null);
  };

  return (
    <div className="container">
      <h2>Manage Organizations</h2>

      <div className="d-flex justify-content-between mb-3">
        <button
          className={`icon-delete btn btn-danger ${selectedOrgs.length === 0 ? 'disabled' : ''}`}
          onClick={() => setShowConfirmDelete(true)}
          disabled={selectedOrgs.length === 0}
        >
          <FaTrashAlt /> Delete Selected
        </button>
        <button className="btn btn-success" onClick={() => setShowAddForm(true)}>
          <FaPlus /> Add New Organization
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Select</th>
              <th>Organization Name</th>
              <th>Subscription Plan</th>
              <th>Number of Users</th>
              <th>Active</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {organizations.map((org) => (
              <tr key={org._id} className={selectedOrgs.includes(org._id) ? 'selected' : ''}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedOrgs.includes(org._id)}
                    onChange={() => handleRowClick(org._id)}
                    disabled={org.name === 'Cybernack'} // Disable selection for "Cybernack"
                  />
                </td>
                <td>{org.name}</td>
                <td>{subscriptions.find((sub) => sub._id === org.subscription)?.name || 'Standard'}</td>
                <td>{org.numberOfUsers}</td>
                <td>{org.isActive ? 'Active' : 'Inactive'}</td>
                <td>{new Date(org.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleEditClick(org)}
                    disabled={org.name === 'Cybernack'} // Disable editing for "Cybernack"
                  >
                    <FaEdit /> Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(showAddForm || showEditForm) && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <h4>{showAddForm ? 'Add New Organization' : 'Edit Organization'}</h4>
            <form onSubmit={showAddForm ? handleAddOrganization : handleUpdateOrganization}>
              <div className="form-group">
                <label>Organization Name:</label>
                <input
                  type="text"
                  name="orgName"
                  className="form-control"
                  value={organizationData.orgName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Subscription Plan:</label>
                <select
                  name="subscription"
                  className="form-control"
                  value={organizationData.subscription}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Subscription</option>
                  {subscriptions.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group d-flex align-items-center">
                <label style={{ marginRight: '10px' }}>Active:</label>
                <input
                  type="checkbox"
                  name="isActive"
                  className="form-check-input"
                  checked={organizationData.isActive}
                  onChange={handleChange}
                />
              </div>
              <div className="d-flex mt-3">
                <button type="submit" className="btn btn-primary me-2" disabled={isSubmitting}>
                  {isSubmitting ? (showAddForm ? 'Adding...' : 'Updating...') : showAddForm ? 'Add Organization' : 'Update Organization'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    resetForm();
                    setShowAddForm(false);
                    setShowEditForm(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer />

      {showConfirmDelete && (
        <ConfirmModal
          message={`Are you sure you want to delete ${selectedOrgs.length} organization(s)?`}
          onConfirm={handleDelete}
          onCancel={() => setShowConfirmDelete(false)}
        />
      )}
    </div>
  );
};

const mapStateToProps = (state) => ({
  organizations: state.auth.organizations || [],
  subscriptions: state.subscription.subscriptions || [],
});

export default connect(mapStateToProps, {
  getOrganizations,
  createOrganization,
  deleteOrganizations,
  updateOrganization,
  getSubscriptions,
})(SuperAdminDashboard);