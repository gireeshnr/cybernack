// client/src/components/superAdmin/SuperAdminDashboard.js
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
import OrganizationTable from './OrganizationTable';
import OrganizationForm from './OrganizationForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faPlus, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

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
    isSubmitting: false,
  });
  const [organizationData, setOrganizationData] = useState({
    orgName: '',
    subscription: '',
    isActive: false,
    billingTerm: '',
    subscriptionStartDate: '',
    subscriptionEndDate: '',
  });
  const [columnFilters, setColumnFilters] = useState({
    name: '',
    subscription: '',
    billingTerm: '',
    subscriptionStartDate: '',
    subscriptionEndDate: '',
    isActive: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

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

  useEffect(() => {
    setCurrentPage(1);
  }, [columnFilters]);

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

  const handleRowClick = (orgId) => {
    const org = organizations.find((o) => o._id === orgId && o.name === 'Cybernack');
    if (org) return;
    setSelectedOrgs((prev) =>
      prev.includes(orgId) ? prev.filter((id) => id !== orgId) : [...prev, orgId]
    );
  };

  const handleColumnFilterChange = (column, value) => {
    setColumnFilters((prev) => ({ ...prev, [column]: value }));
  };

  const filteredOrganizations = useMemo(() => {
    return organizations.filter((org) => {
      let match = true;
      if (columnFilters.name && !org.name.toLowerCase().includes(columnFilters.name.toLowerCase())) {
        match = false;
      }
      if (columnFilters.subscription) {
        const subName = org.subscriptionName || '';
        if (!subName.toLowerCase().includes(columnFilters.subscription.toLowerCase())) {
          match = false;
        }
      }
      if (columnFilters.billingTerm && (!org.billingTerm || !org.billingTerm.toLowerCase().includes(columnFilters.billingTerm.toLowerCase()))) {
        match = false;
      }
      if (columnFilters.subscriptionStartDate && org.subscriptionStartDate) {
        const startStr = new Date(org.subscriptionStartDate).toLocaleDateString();
        if (!startStr.toLowerCase().includes(columnFilters.subscriptionStartDate.toLowerCase())) {
          match = false;
        }
      }
      if (columnFilters.subscriptionEndDate && org.subscriptionEndDate) {
        const endStr = new Date(org.subscriptionEndDate).toLocaleDateString();
        if (!endStr.toLowerCase().includes(columnFilters.subscriptionEndDate.toLowerCase())) {
          match = false;
        }
      }
      if (columnFilters.isActive) {
        const activeStr = org.isActive ? 'active' : 'inactive';
        if (!activeStr.toLowerCase().includes(columnFilters.isActive.toLowerCase())) {
          match = false;
        }
      }
      return match;
    });
  }, [organizations, columnFilters]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredOrganizations.length / recordsPerPage);
  }, [filteredOrganizations, recordsPerPage]);

  const displayedOrganizations = useMemo(() => {
    const startIdx = (currentPage - 1) * recordsPerPage;
    return filteredOrganizations.slice(startIdx, startIdx + recordsPerPage);
  }, [filteredOrganizations, currentPage, recordsPerPage]);

  const allSelected = useMemo(() => {
    return displayedOrganizations.length > 0 && selectedOrgs.length === displayedOrganizations.length;
  }, [displayedOrganizations, selectedOrgs]);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Create
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
    } catch (err) {
      toast.error('Error adding organization. Please try again.');
    } finally {
      setFormState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  // Edit
  const handleEditClick = (org) => {
    const subscriptionId =
      typeof org.subscription === 'object'
        ? org.subscription?._id || ''
        : org.subscription || '';
    setEditingOrg(org);
    setOrganizationData({
      orgName: org.name || '',
      subscription: subscriptionId,
      isActive: !!org.isActive,
      billingTerm: org.billingTerm || '',
      subscriptionStartDate: org.subscriptionStartDate ? org.subscriptionStartDate.slice(0, 10) : '',
      subscriptionEndDate: org.subscriptionEndDate ? org.subscriptionEndDate.slice(0, 10) : '',
    });
    setFormState({ showAddForm: false, showEditForm: true, isSubmitting: false });
  };
  const handleUpdateOrganization = async () => {
    if (!editingOrg) {
      toast.error('No organization is being edited.');
      return;
    }
    setFormState((prev) => ({ ...prev, isSubmitting: true }));
    try {
      await updateOrganization(editingOrg._id, organizationData);
      toast.success('Organization updated successfully!');
      resetForm();
      await getOrganizations();
      setFormState({ showAddForm: false, showEditForm: false, isSubmitting: false });
    } catch (err) {
      toast.error('Error updating organization. Please try again.');
      setFormState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  // Delete
  const handleDeleteOrganizations = async () => {
    if (!selectedOrgs.length) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedOrgs.length} organization(s)?`)) {
      return;
    }
    try {
      await deleteOrganizations(selectedOrgs);
      setSelectedOrgs([]);
      toast.success(`${selectedOrgs.length} organization(s) deleted successfully!`);
      await getOrganizations();
    } catch (err) {
      toast.error('Error deleting organizations. Please try again.');
    }
  };

  return (
    <div className="container">
      <h2>Manage Organizations</h2>
      {/* Top Action Row */}
      <div className="d-flex justify-content-between mb-3">
        <button
          className={`btn btn-danger ${selectedOrgs.length === 0 ? 'disabled' : ''}`}
          onClick={handleDeleteOrganizations}
          disabled={selectedOrgs.length === 0}
        >
          <FontAwesomeIcon icon={faTrashAlt} />
        </button>
        <button
          className="btn btn-success"
          onClick={() =>
            setFormState((prev) => ({ ...prev, showAddForm: true, showEditForm: false }))
          }
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>
      {/* Pagination top */}
      <div className="d-flex justify-content-end mb-2">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          style={{ background: 'transparent', border: 'none' }}
          title="Previous"
        >
          <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: '1rem' }} />
        </button>
        <span className="align-self-center mx-2">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages || totalPages === 0}
          style={{ background: 'transparent', border: 'none' }}
          title="Next"
        >
          <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: '1rem' }} />
        </button>
      </div>

      <OrganizationTable
        organizations={displayedOrganizations}
        selectedOrgs={selectedOrgs}
        onRowClick={handleRowClick}
        onEditClick={handleEditClick}
        columnFilters={columnFilters}
        onColumnFilterChange={handleColumnFilterChange}
        onToggleSelectAll={() => {
          if (allSelected) {
            setSelectedOrgs([]);
          } else {
            const allIds = displayedOrganizations.map((org) => org._id);
            setSelectedOrgs(allIds);
          }
        }}
        allSelected={allSelected}
      />

      {/* Pagination bottom */}
      <div className="d-flex justify-content-end mt-2">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          style={{ background: 'transparent', border: 'none' }}
          title="Previous"
        >
          <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: '1rem' }} />
        </button>
        <span className="align-self-center mx-2">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages || totalPages === 0}
          style={{ background: 'transparent', border: 'none' }}
          title="Next"
        >
          <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: '1rem' }} />
        </button>
      </div>

      {/* Add/Edit Form */}
      {(formState.showAddForm || formState.showEditForm) && (
        <OrganizationForm
          isEditing={formState.showEditForm}
          data={organizationData}
          setData={setOrganizationData}
          onSubmit={formState.showAddForm ? handleAddOrganization : handleUpdateOrganization}
          isSubmitting={formState.isSubmitting}
          onCancel={() => {
            resetForm();
            setFormState({
              showAddForm: false,
              showEditForm: false,
              isSubmitting: false,
            });
          }}
          subscriptions={subscriptions}
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
  organizations: PropTypes.array.isRequired,
  subscriptions: PropTypes.array.isRequired,
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