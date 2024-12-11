import React, { useState, useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  getOrganizations,
  createOrganization,
  deleteOrganizations,
  updateOrganization,
  getSubscriptions,
} from '../../auth/actions';
import toast from 'react-hot-toast';
import ConfirmModal from '../ConfirmModal';
import OrganizationTable from './OrganizationTable';
import OrganizationForm from './OrganizationForm';
// Import only the required FontAwesome components/icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faPlus } from '@fortawesome/free-solid-svg-icons';

const SuperAdminDashboard = ({
  getOrganizations,
  getSubscriptions,
  createOrganization,
  deleteOrganizations,
  updateOrganization,
  organizations,
  subscriptions,
}) => {
  const [selectedOrgs, setSelectedOrgs] = useState([]);
  const [formState, setFormState] = useState({
    showAddForm: false,
    showEditForm: false,
    showConfirmDelete: false,
    isSubmitting: false,
  });
  const [organizationData, setOrganizationData] = useState({
    orgName: '',
    subscription: '',
    isActive: false,
  });
  const [editingOrg, setEditingOrg] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([getOrganizations(), getSubscriptions()]);
      } catch {
        toast.error('Error fetching data. Please try again.');
      }
    };
    fetchData();
  }, [getOrganizations, getSubscriptions]);

  const resetForm = () => {
    setOrganizationData({ orgName: '', subscription: '', isActive: false });
    setEditingOrg(null);
  };

  const handleRowClick = (orgId) => {
    if (organizations.find((org) => org._id === orgId && org.name === 'Cybernack')) return;
    setSelectedOrgs((prevSelected) =>
      prevSelected.includes(orgId) ? prevSelected.filter((id) => id !== orgId) : [...prevSelected, orgId]
    );
  };

  const handleAddOrganization = async () => {
    if (!organizationData.subscription) {
      toast.error('Please select a subscription.');
      return;
    }
    setFormState((prev) => ({ ...prev, isSubmitting: true }));
    try {
      await createOrganization(organizationData);
      toast.success('New organization added successfully!');
      resetForm();
      await getOrganizations();
      setFormState((prev) => ({ ...prev, showAddForm: false }));
    } catch {
      toast.error('Error adding organization. Please try again.');
    } finally {
      setFormState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleEditClick = (org) => {
    if (org.name === 'Cybernack') return;
    setOrganizationData({
      orgName: org.name,
      subscription: org.subscription?._id || '',
      isActive: org.isActive || false,
    });
    setEditingOrg(org);
    setFormState((prev) => ({ ...prev, showEditForm: true }));
  };

  const handleUpdateOrganization = async () => {
    setFormState((prev) => ({ ...prev, isSubmitting: true }));
    try {
      await updateOrganization(editingOrg._id, organizationData);
      toast.success('Organization updated successfully!');
      resetForm();
      await getOrganizations();
      setFormState((prev) => ({ ...prev, showEditForm: false }));
    } catch {
      toast.error('Error updating organization. Please try again.');
    } finally {
      setFormState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleDeleteOrganizations = async () => {
    try {
      await deleteOrganizations(selectedOrgs);
      setSelectedOrgs([]);
      toast.success(`${selectedOrgs.length} organization(s) deleted successfully!`);
      await getOrganizations();
      setFormState((prev) => ({ ...prev, showConfirmDelete: false }));
    } catch {
      toast.error('Error deleting organizations. Please try again.');
    }
  };

  const tableData = useMemo(() => {
    return organizations.map((org) => ({
      ...org,
      subscriptionName: subscriptions.find((sub) => sub._id === org.subscription)?.name || 'Standard',
    }));
  }, [organizations, subscriptions]);

  return (
    <div className="container">
      <h2>Manage Organizations</h2>

      <div className="d-flex justify-content-between mb-3">
        <button
          className={`btn btn-danger ${selectedOrgs.length === 0 ? 'disabled' : ''}`}
          onClick={() => setFormState((prev) => ({ ...prev, showConfirmDelete: true }))}
          disabled={selectedOrgs.length === 0}
        >
          <FontAwesomeIcon icon={faTrashAlt} /> Delete Selected
        </button>
        <button
          className="btn btn-success"
          onClick={() => setFormState((prev) => ({ ...prev, showAddForm: true }))}
        >
          <FontAwesomeIcon icon={faPlus} /> Add New Organization
        </button>
      </div>

      <OrganizationTable
        organizations={tableData}
        selectedOrgs={selectedOrgs}
        onRowClick={handleRowClick}
        onEditClick={handleEditClick}
      />

      {(formState.showAddForm || formState.showEditForm) && (
        <OrganizationForm
          isEditing={formState.showEditForm}
          data={organizationData}
          setData={setOrganizationData}
          onSubmit={formState.showAddForm ? handleAddOrganization : handleUpdateOrganization}
          isSubmitting={formState.isSubmitting}
          onCancel={() => {
            resetForm();
            setFormState({ showAddForm: false, showEditForm: false, showConfirmDelete: false, isSubmitting: false });
          }}
          subscriptions={subscriptions}
        />
      )}

      {formState.showConfirmDelete && (
        <ConfirmModal
          message={`Are you sure you want to delete ${selectedOrgs.length} organization(s)?`}
          onConfirm={handleDeleteOrganizations}
          onCancel={() => setFormState((prev) => ({ ...prev, showConfirmDelete: false }))}
        />
      )}
    </div>
  );
};

SuperAdminDashboard.propTypes = {
  getOrganizations: PropTypes.func.isRequired,
  getSubscriptions: PropTypes.func.isRequired,
  createOrganization: PropTypes.func.isRequired,
  deleteOrganizations: PropTypes.func.isRequired,
  updateOrganization: PropTypes.func.isRequired,
  organizations: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      subscription: PropTypes.string,
      isActive: PropTypes.bool,
    })
  ).isRequired,
  subscriptions: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
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