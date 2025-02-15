import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDomains, createDomain, updateDomain, deleteDomain } from '../../../reducers/domainSlice';
import { fetchIndustries } from '../../../reducers/industrySlice';
import { getSubscriptions } from '../../../auth/subscriptionActions';
import DomainForm from './DomainForm';
import ConfirmModal from '../../ConfirmModal';
import DomainTable from './DomainTable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faPlus, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

const DomainPage = () => {
  const dispatch = useDispatch();
  const { domains, loading, error } = useSelector((state) => state.domains);
  const { industries } = useSelector((state) => state.industries);
  const { subscriptions } = useSelector((state) => state.subscription);

  const [selectedDomains, setSelectedDomains] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [domainData, setDomainData] = useState({
    name: '',
    description: '',
    industries: [],
    subscription_id: '',
  });
  const [editingDomain, setEditingDomain] = useState(null);

  // Column filters
  const [columnFilters, setColumnFilters] = useState({
    name: '',
    description: '',
    industries: '',
    subscription: '',
    addedBy: '',
    createdAt: '',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    dispatch(fetchDomains());
    dispatch(fetchIndustries());
    dispatch(getSubscriptions());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error}`);
    }
  }, [error]);

  // Reset current page whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [columnFilters]);

  const resetForm = () => {
    setDomainData({ name: '', description: '', industries: [], subscription_id: '' });
    setEditingDomain(null);
  };

  const closeModal = () => {
    resetForm();
    setShowModal(false);
  };

  const handleRowClick = (id) => {
    if (selectedDomains.includes(id)) {
      setSelectedDomains(selectedDomains.filter((item) => item !== id));
    } else {
      setSelectedDomains([...selectedDomains, id]);
    }
  };

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

  const handleAddDomain = async () => {
    if (!domainData.name) {
      toast.error('Domain name is required.');
      return;
    }
    if (!domainData.industries || domainData.industries.length === 0) {
      toast.error('At least one Industry is required.');
      return;
    }
    try {
      await dispatch(createDomain(domainData));
      dispatch(fetchDomains());
      closeModal();
    } catch {}
  };

  const handleUpdateDomain = async () => {
    if (!domainData.industries || domainData.industries.length === 0) {
      toast.error('At least one Industry is required.');
      return;
    }
    try {
      await dispatch(updateDomain({ id: editingDomain._id, domainData }));
      dispatch(fetchDomains());
      closeModal();
    } catch {}
  };

  const handleDeleteDomains = async () => {
    try {
      for (const id of selectedDomains) {
        await dispatch(deleteDomain(id));
      }
      dispatch(fetchDomains());
      setSelectedDomains([]);
      setAllSelected(false);
      setShowConfirmDelete(false);
    } catch {}
  };

  const handleEditClick = (domain) => {
    const industryIds =
      Array.isArray(domain.industries)
        ? domain.industries.map((ind) => (typeof ind === 'object' ? ind._id : ind))
        : [];
    setDomainData({
      name: domain.name,
      description: domain.description || '',
      industries: industryIds,
      subscription_id:
        (domain.subscription_id && domain.subscription_id._id) ||
        domain.subscription_id ||
        '',
    });
    setEditingDomain(domain);
    setShowModal(true);
  };

  const handleColumnFilterChange = (column, value) => {
    setColumnFilters((prev) => ({ ...prev, [column]: value }));
  };

  // Apply column filters
  const filteredDomains = domains.filter((domain) => {
    let match = true;
    if (columnFilters.name && !domain.name.toLowerCase().includes(columnFilters.name.toLowerCase())) {
      match = false;
    }
    if (columnFilters.description && (!domain.description || !domain.description.toLowerCase().includes(columnFilters.description.toLowerCase()))) {
      match = false;
    }
    if (columnFilters.industries) {
      const indNames = Array.isArray(domain.industries)
        ? domain.industries.map((ind) => (typeof ind === 'object' ? ind.name : '')).join(', ')
        : '';
      if (!indNames.toLowerCase().includes(columnFilters.industries.toLowerCase())) {
        match = false;
      }
    }
    if (columnFilters.subscription) {
      let subName = '';
      if (domain.subscription_id && typeof domain.subscription_id === 'object') {
        subName = domain.subscription_id.name || '';
      }
      if (!subName.toLowerCase().includes(columnFilters.subscription.toLowerCase())) {
        match = false;
      }
    }
    if (columnFilters.addedBy) {
      if (!domain.addedBy || !domain.addedBy.toLowerCase().includes(columnFilters.addedBy.toLowerCase())) {
        match = false;
      }
    }
    if (columnFilters.createdAt && domain.createdAt) {
      const createdAtStr = new Date(domain.createdAt).toLocaleDateString();
      if (!createdAtStr.toLowerCase().includes(columnFilters.createdAt.toLowerCase())) {
        match = false;
      }
    }
    return match;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredDomains.length / recordsPerPage);
  const displayedDomains = filteredDomains.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="container">
      <h2>Manage Domains</h2>
      {/* Action Buttons Row */}
      <div className="d-flex justify-content-between mb-2">
        <button
          className={`btn btn-danger ${selectedDomains.length === 0 ? 'disabled' : ''}`}
          onClick={() => setShowConfirmDelete(true)}
          disabled={selectedDomains.length === 0}
        >
          <FontAwesomeIcon icon={faTrashAlt} />
        </button>
        <button
          className="btn btn-success"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>
      {/* Pagination Controls (top right) with icons only */}
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
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          style={{ background: 'transparent', border: 'none' }}
          title="Next Page"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
      <DomainTable
        domains={displayedDomains}
        selectedDomains={selectedDomains}
        onRowClick={handleRowClick}
        onEditClick={handleEditClick}
        columnFilters={columnFilters}
        onColumnFilterChange={handleColumnFilterChange}
        onToggleSelectAll={toggleSelectAll}
        allSelected={allSelected}
      />
      {/* Pagination Controls (bottom right) with icons only */}
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
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          style={{ background: 'transparent', border: 'none' }}
          title="Next Page"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
      {showConfirmDelete && (
        <ConfirmModal
          message={`Are you sure you want to delete ${selectedDomains.length} domain(s)?`}
          onConfirm={handleDeleteDomains}
          onCancel={() => setShowConfirmDelete(false)}
        />
      )}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingDomain ? 'Edit Domain' : 'Add New Domain'}
                </h5>
                <button type="button" className="close" onClick={closeModal}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <DomainForm
                  isEditing={!!editingDomain}
                  data={domainData}
                  setData={setDomainData}
                  onSubmit={editingDomain ? handleUpdateDomain : handleAddDomain}
                  isSubmitting={false}
                  onCancel={closeModal}
                  allIndustries={industries}
                  allSubscriptions={subscriptions}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {error && <div className="alert alert-danger mt-2">{error}</div>}
    </div>
  );
};

export default DomainPage;