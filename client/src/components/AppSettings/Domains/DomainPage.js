// client/src/components/AppSettings/Domains/DomainPage.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDomains,
  createDomain,
  updateDomain,
  deleteDomain
} from '../../../reducers/domainSlice';
import {
  fetchIndustries,
  createIndustry  // <-- Make sure this action is exported in industrySlice
} from '../../../reducers/industrySlice';
import { getSubscriptions } from '../../../auth/subscriptionActions';
import DomainForm from './DomainForm';
import DomainTable from './DomainTable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrashAlt,
  faPlus,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

const DomainPage = () => {
  const dispatch = useDispatch();
  const { domains, loading, error } = useSelector((state) => state.domains);
  const { subscriptions } = useSelector((state) => state.subscription);
  const { industries: allIndustries } = useSelector((state) => state.industries);
  const { profile } = useSelector((state) => state.auth);

  const isSuperadmin = profile?.role?.toLowerCase() === 'superadmin';
  const organizationId = profile?.organization?._id;

  // State for global/local tab
  const [activeTab, setActiveTab] = useState('global');
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form data for add/edit
  const [domainData, setDomainData] = useState({
    name: '',
    description: '',
    industry_id: '',
    subscription_id: isSuperadmin ? '' : '', 
  });
  const [editingDomain, setEditingDomain] = useState(null);

  // Column filters
  const [columnFilters, setColumnFilters] = useState({
    name: '',
    description: '',
    industry: '',
    subscription: '',
    addedBy: '',
    createdAt: '',
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchDomains());
    dispatch(getSubscriptions());
    dispatch(fetchIndustries());
  }, [dispatch]);

  // Show any errors
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Reset page on filter/tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [columnFilters, activeTab]);

  // Helper to reset the form data
  const resetForm = () => {
    setDomainData({
      name: '',
      description: '',
      industry_id: '',
      subscription_id: isSuperadmin ? '' : ''
    });
    setEditingDomain(null);
  };

  // Close the add/edit modal
  const closeModal = () => {
    resetForm();
    setShowModal(false);
  };

  // Toggle domain row selection
  const handleRowClick = (id) => {
    if (selectedDomains.includes(id)) {
      setSelectedDomains(selectedDomains.filter((item) => item !== id));
    } else {
      setSelectedDomains([...selectedDomains, id]);
    }
  };

  // Toggle "select all" rows
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedDomains([]);
      setAllSelected(false);
    } else {
      const allIds = filteredDomains.map((d) => d._id);
      setSelectedDomains(allIds);
      setAllSelected(true);
    }
  };

  /**
   * Helper function:
   * Create (or find existing) Industry that matches local admin's org name.
   */
  const createOrGetLocalIndustry = async () => {
    // Find an existing industry with the same name & same ownerOrgId
    let matchedIndustry = allIndustries.find(
      (ind) =>
        ind.name.toLowerCase() === profile.organization.name.toLowerCase() &&
        ind.ownerOrgId?.toString() === organizationId?.toString()
    );

    if (!matchedIndustry) {
      // If not found, create it
      try {
        const result = await dispatch(
          createIndustry({
            name: profile.organization.name,
            description: `Auto-created for ${profile.organization.name}`,
            subscription_id: profile.organization.subscription._id,
            ownerOrgId: organizationId,
            creatorRole: 'admin',
            addedBy: profile.email || ''
          })
        ).unwrap();

        matchedIndustry = result; // The newly created industry
        // Optionally refresh industries so we have the new one in store
        dispatch(fetchIndustries());
      } catch (err) {
        toast.error(`Failed to auto-create industry for "${profile.organization.name}"`);
        return null;
      }
    }
    return matchedIndustry;
  };

  // Create Domain
  const handleAddDomain = async () => {
    if (!domainData.name) {
      toast.error('Domain name is required.');
      return;
    }

    const payload = { ...domainData };

    if (!isSuperadmin) {
      payload.ownerOrgId = organizationId;
      payload.subscription_id = profile.organization.subscription._id;

      // Get or create the local admin's matching industry
      const localIndustry = await createOrGetLocalIndustry();
      if (!localIndustry) return; // If creation fails, exit
      payload.industry_id = localIndustry._id;
    }

    try {
      await dispatch(createDomain(payload));
      dispatch(fetchDomains());
      closeModal();
    } catch (err) {
      toast.error('Failed to create domain');
    }
  };

  // Update Domain
  const handleUpdateDomain = async () => {
    if (!domainData.name) {
      toast.error('Domain name is required.');
      return;
    }

    const payload = { ...domainData };

    if (!isSuperadmin) {
      payload.ownerOrgId = organizationId;
      payload.subscription_id = profile.organization.subscription._id;

      // Get or create the local admin's matching industry
      const localIndustry = await createOrGetLocalIndustry();
      if (!localIndustry) return;
      payload.industry_id = localIndustry._id;
    }

    try {
      await dispatch(
        updateDomain({ id: editingDomain._id, domainData: payload })
      );
      dispatch(fetchDomains());
      closeModal();
    } catch (err) {
      toast.error('Failed to update domain');
    }
  };

  // Delete selected domains
  const handleDeleteDomains = async () => {
    if (!selectedDomains.length) return;
    if (!window.confirm(`Delete ${selectedDomains.length} domain(s)?`)) return;

    try {
      for (const id of selectedDomains) {
        await dispatch(deleteDomain(id));
      }
      toast.success(`Deleted ${selectedDomains.length} record(s)!`);
      setSelectedDomains([]);
      setAllSelected(false);
      dispatch(fetchDomains());
    } catch (err) {
      toast.error('Failed to delete domains');
    }
  };

  // Edit domain button click
  const handleEditClick = (domain) => {
    // Prevent local admin from editing global records
    if (!isSuperadmin && domain.creatorRole === 'superadmin') {
      toast.error('You cannot edit global records');
      return;
    }
    // Prevent superadmin from editing local records
    if (isSuperadmin && domain.creatorRole === 'admin') {
      toast.error('Superadmin cannot edit local records');
      return;
    }
    setEditingDomain(domain);
    setDomainData({
      name: domain.name,
      description: domain.description || '',
      industry_id:
        domain.industry_id && typeof domain.industry_id === 'object'
          ? domain.industry_id._id
          : domain.industry_id || '',
      subscription_id:
        domain.subscription_id && typeof domain.subscription_id === 'object'
          ? domain.subscription_id._id
          : domain.subscription_id || ''
    });
    setShowModal(true);
  };

  // Filter changes
  const handleColumnFilterChange = (column, value) => {
    setColumnFilters((prev) => ({ ...prev, [column]: value }));
    setCurrentPage(1);
  };

  // Filtered domain list based on activeTab and filters
  const filteredDomains = domains.filter((d) => {
    let match = true;
    // Global vs Local
    if (activeTab === 'global') {
      match = d.creatorRole === 'superadmin';
    } else {
      if (isSuperadmin) {
        match = d.creatorRole === 'admin';
      } else {
        match =
          d.creatorRole === 'admin' &&
          d.ownerOrgId &&
          d.ownerOrgId.toString() === organizationId?.toString();
      }
    }
    // Name filter
    if (columnFilters.name && !d.name.toLowerCase().includes(columnFilters.name.toLowerCase())) {
      match = false;
    }
    // Additional filters (description, subscription, etc.) can go here if needed
    return match;
  });

  // Pagination
  const totalPages = Math.ceil(filteredDomains.length / recordsPerPage);
  const displayedDomains = filteredDomains.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // For superadmins, we can filter industries by subscription
  const getFilteredIndustries = () => {
    if (!isSuperadmin) return [];
    if (!domainData.subscription_id) return [];
    return allIndustries.filter((ind) => {
      if (!ind.subscription_id || ind.creatorRole !== 'superadmin') return false;
      let subId = '';
      if (typeof ind.subscription_id === 'object') {
        subId = ind.subscription_id._id
          ? ind.subscription_id._id.toString()
          : ind.subscription_id.toString();
      } else {
        subId = ind.subscription_id;
      }
      return subId === domainData.subscription_id;
    });
  };

  return (
    <div className="container mt-3">
      <h2>Manage Domains</h2>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'global' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('global');
              setSelectedDomains([]);
              setAllSelected(false);
            }}
          >
            Global
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'local' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('local');
              setSelectedDomains([]);
              setAllSelected(false);
            }}
          >
            Local
          </button>
        </li>
      </ul>

      {/* Action Buttons */}
      <div className="d-flex justify-content-between mb-2">
        {(activeTab === 'local' || isSuperadmin) && (
          <button
            className={`btn btn-danger ${selectedDomains.length === 0 ? 'disabled' : ''}`}
            onClick={handleDeleteDomains}
            disabled={selectedDomains.length === 0}
          >
            <FontAwesomeIcon icon={faTrashAlt} />
          </button>
        )}
        {((activeTab === 'global' && isSuperadmin) ||
          (activeTab === 'local' && !isSuperadmin)) && (
          <button
            className="btn btn-success"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        )}
      </div>

      {/* Top Pagination */}
      <div className="d-flex justify-content-end mb-2">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          style={{ background: 'transparent', border: 'none' }}
          title="Previous Page"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <span className="align-self-center mx-2">
          {currentPage} / {totalPages || 1}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages || totalPages === 0}
          style={{ background: 'transparent', border: 'none' }}
          title="Next Page"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>

      {/* Domain Table */}
      <DomainTable
        domains={displayedDomains}
        selectedDomains={selectedDomains}
        onRowClick={handleRowClick}
        onEditClick={handleEditClick}
        columnFilters={columnFilters}
        onColumnFilterChange={handleColumnFilterChange}
        onToggleSelectAll={toggleSelectAll}
        allSelected={allSelected}
        isSuperadmin={isSuperadmin}
        activeTab={activeTab}
      />

      {/* Bottom Pagination */}
      <div className="d-flex justify-content-end mt-2">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          style={{ background: 'transparent', border: 'none' }}
          title="Previous Page"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <span className="align-self-center mx-2">
          {currentPage} / {totalPages || 1}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages || totalPages === 0}
          style={{ background: 'transparent', border: 'none' }}
          title="Next Page"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingDomain ? 'Edit Domain' : 'Add New Domain'}
                </h5>
                <button
                  type="button"
                  className="close"
                  onClick={closeModal}
                  style={{ background: 'none', border: 'none' }}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <DomainForm
                  isEditing={!!editingDomain}
                  data={domainData}
                  setData={setDomainData}
                  onSubmit={editingDomain ? handleUpdateDomain : handleAddDomain}
                  isSubmitting={loading}
                  onCancel={closeModal}
                  allSubscriptions={subscriptions}
                  // Superadmin sees filtered industries; local admin sees empty array
                  allIndustries={isSuperadmin ? getFilteredIndustries() : []}
                  isSuperadmin={isSuperadmin}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DomainPage;