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
  const [editingOrg, setEditingOrg] = useState(null);

  const [formState, setFormState] = useState({
    showAddForm: false,
    showEditForm: false,
    showConfirmDelete: false,
    isSubmitting: false,
  });

  // The form data for create/edit
  const [organizationData, setOrganizationData] = useState({
    orgName: '',
    subscription: '',
    isActive: false,
    billingTerm: '',
    subscriptionStartDate: '',
    subscriptionEndDate: '',
  });

  /*************************************************
   * Log in client console to see the updated org data
   *************************************************/
  useEffect(() => {
    console.log('[CLIENT] Current organizationData in state:', organizationData);
  }, [organizationData]);

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
    setOrganizationData({
      orgName: '',
      subscription: '',
      isActive: false,
      billingTerm: '',
      subscriptionStartDate: '',
      subscriptionEndDate: '',
    });
    setEditingOrg(null);
  };

  /************************************************************
   * TABLE SELECTION
   ************************************************************/
  const handleRowClick = (orgId) => {
    // Skip selecting "Cybernack" if that's your main org
    const org = organizations.find((o) => o._id === orgId && o.name === 'Cybernack');
    if (org) return;

    setSelectedOrgs((prevSelected) =>
      prevSelected.includes(orgId)
        ? prevSelected.filter((id) => id !== orgId)
        : [...prevSelected, orgId]
    );
  };

  /************************************************************
   * ADD ORGANIZATION
   ************************************************************/
  const handleAddOrganization = async () => {
    console.log('[CLIENT] handleAddOrganization. Data to send:', organizationData);

    if (!organizationData.subscription) {
      toast.error('Please select a subscription.');
      return;
    }
    setFormState((prev) => ({ ...prev, isSubmitting: true }));
    try {
      await createOrganization(organizationData);
      toast.success('New organization added successfully!');
      resetForm();
      // Re-fetch to see new org
      await getOrganizations();
      setFormState((prev) => ({ ...prev, showAddForm: false }));
    } catch (err) {
      console.error('[CLIENT] Error adding organization:', err);
      toast.error('Error adding organization. Please try again.');
    } finally {
      setFormState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  /************************************************************
   * EDIT ORGANIZATION
   ************************************************************/
  const handleEditClick = (org) => {
    console.log('[CLIENT] handleEditClick for org:', org);

    setEditingOrg(org);

    // If org.subscription is an object, use org.subscription._id
    const subscriptionId =
      typeof org.subscription === 'object'
        ? org.subscription?._id || ''
        : org.subscription || '';

    setOrganizationData({
      orgName: org.name || '',
      subscription: subscriptionId,
      isActive: !!org.isActive,
      billingTerm: org.billingTerm || '',
      subscriptionStartDate: org.subscriptionStartDate
        ? org.subscriptionStartDate.slice(0, 10)
        : '',
      subscriptionEndDate: org.subscriptionEndDate
        ? org.subscriptionEndDate.slice(0, 10)
        : '',
    });

    setFormState((prev) => ({
      ...prev,
      showAddForm: false,
      showEditForm: true,
    }));
  };

  /************************************************************
   * UPDATE ORGANIZATION
   ************************************************************/
  const handleUpdateOrganization = async () => {
    if (!editingOrg) {
      toast.error('No organization is being edited.');
      return;
    }

    console.log(
      '[CLIENT] handleUpdateOrganization. Sending data:',
      organizationData
    );

    setFormState((prev) => ({ ...prev, isSubmitting: true }));
    try {
      await updateOrganization(editingOrg._id, organizationData);

      toast.success('Organization updated successfully!');
      resetForm();
      // Re-fetch to see updated fields
      await getOrganizations();
      setFormState((prev) => ({ ...prev, showEditForm: false }));
    } catch (err) {
      console.error('[CLIENT] Error updating organization:', err);
      toast.error('Error updating organization. Please try again.');
    } finally {
      setFormState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  /************************************************************
   * DELETE ORGANIZATIONS
   ************************************************************/
  const handleDeleteOrganizations = async () => {
    console.log('[CLIENT] Deleting org IDs:', selectedOrgs);

    try {
      await deleteOrganizations(selectedOrgs);
      setSelectedOrgs([]);
      toast.success(`${selectedOrgs.length} organization(s) deleted successfully!`);
      await getOrganizations();
      setFormState((prev) => ({ ...prev, showConfirmDelete: false }));
    } catch (err) {
      console.error('[CLIENT] Error deleting organizations:', err);
      toast.error('Error deleting organizations. Please try again.');
    }
  };

  /************************************************************
   * TABLE DATA
   ************************************************************/
  const tableData = useMemo(() => {
    return organizations.map((org) => {
      const subscriptionId =
        typeof org.subscription === 'object'
          ? org.subscription?._id || ''
          : org.subscription || '';

      const subMatch = subscriptions.find((sub) => sub._id === subscriptionId);

      return {
        ...org,
        subscriptionName: subMatch ? subMatch.name : 'Standard',
      };
    });
  }, [organizations, subscriptions]);

  return (
    <div className="container">
      <h2>Manage Organizations</h2>

      <div className="d-flex justify-content-between mb-3">
        <button
          className={`btn btn-danger ${
            selectedOrgs.length === 0 ? 'disabled' : ''
          }`}
          onClick={() =>
            setFormState((prev) => ({ ...prev, showConfirmDelete: true }))
          }
          disabled={selectedOrgs.length === 0}
        >
          <FontAwesomeIcon icon={faTrashAlt} /> Delete Selected
        </button>

        <button
          className="btn btn-success"
          onClick={() =>
            setFormState((prev) => ({
              ...prev,
              showAddForm: true,
              showEditForm: false,
            }))
          }
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

      {/* Show the form if adding or editing */}
      {(formState.showAddForm || formState.showEditForm) && (
        <OrganizationForm
          isEditing={formState.showEditForm}
          data={organizationData}
          setData={setOrganizationData}
          onSubmit={
            formState.showAddForm
              ? handleAddOrganization
              : handleUpdateOrganization
          }
          isSubmitting={formState.isSubmitting}
          onCancel={() => {
            resetForm();
            setFormState({
              showAddForm: false,
              showEditForm: false,
              showConfirmDelete: false,
              isSubmitting: false,
            });
          }}
          subscriptions={subscriptions}
        />
      )}

      {formState.showConfirmDelete && (
        <ConfirmModal
          message={`Are you sure you want to delete ${selectedOrgs.length} organization(s)?`}
          onConfirm={handleDeleteOrganizations}
          onCancel={() =>
            setFormState((prev) => ({ ...prev, showConfirmDelete: false }))
          }
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
      subscription: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      isActive: PropTypes.bool,
      billingTerm: PropTypes.string,
      subscriptionStartDate: PropTypes.string,
      subscriptionEndDate: PropTypes.string,
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