import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIndustries, createIndustry, updateIndustry, deleteIndustry } from '../../../reducers/industrySlice';
import { getSubscriptions } from '../../../auth/subscriptionActions';
import IndustryForm from './IndustryForm';
import ConfirmModal from '../../ConfirmModal';
import IndustryTable from './IndustryTable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faPlus, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

const IndustryPage = () => {
  const dispatch = useDispatch();
  const { industries, loading, error } = useSelector((state) => state.industries);
  const { subscriptions } = useSelector((state) => state.subscription);

  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [industryData, setIndustryData] = useState({
    name: '',
    description: '',
    subscription_id: '',
  });
  const [editingIndustry, setEditingIndustry] = useState(null);

  // Column filters
  const [columnFilters, setColumnFilters] = useState({
    name: '',
    description: '',
    subscription: '',
    addedBy: '',
    createdAt: '',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
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
    setIndustryData({ name: '', description: '', subscription_id: '' });
    setEditingIndustry(null);
  };

  const closeModal = () => {
    resetForm();
    setShowModal(false);
  };

  const handleRowClick = (id) => {
    if (selectedIndustries.includes(id)) {
      setSelectedIndustries(selectedIndustries.filter((item) => item !== id));
    } else {
      setSelectedIndustries([...selectedIndustries, id]);
    }
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIndustries([]);
      setAllSelected(false);
    } else {
      const allIds = filteredIndustries.map((i) => i._id);
      setSelectedIndustries(allIds);
      setAllSelected(true);
    }
  };

  const handleAddIndustry = async () => {
    if (!industryData.name) {
      toast.error('Industry name is required.');
      return;
    }
    try {
      await dispatch(createIndustry(industryData));
      dispatch(fetchIndustries());
      closeModal();
    } catch {}
  };

  const handleUpdateIndustry = async () => {
    try {
      await dispatch(updateIndustry({ id: editingIndustry._id, industryData }));
      dispatch(fetchIndustries());
      closeModal();
    } catch {}
  };

  const handleDeleteIndustries = async () => {
    try {
      for (const id of selectedIndustries) {
        await dispatch(deleteIndustry(id));
      }
      dispatch(fetchIndustries());
      setSelectedIndustries([]);
      setAllSelected(false);
      setShowConfirmDelete(false);
    } catch {}
  };

  const handleEditClick = (industry) => {
    setIndustryData({
      name: industry.name,
      description: industry.description || '',
      subscription_id:
        (industry.subscription_id && industry.subscription_id._id) ||
        industry.subscription_id ||
        '',
    });
    setEditingIndustry(industry);
    setShowModal(true);
  };

  const handleColumnFilterChange = (column, value) => {
    setColumnFilters((prev) => ({ ...prev, [column]: value }));
  };

  const filteredIndustries = industries.filter((industry) => {
    let match = true;
    if (columnFilters.name && !industry.name.toLowerCase().includes(columnFilters.name.toLowerCase())) {
      match = false;
    }
    if (columnFilters.description && (!industry.description || !industry.description.toLowerCase().includes(columnFilters.description.toLowerCase()))) {
      match = false;
    }
    if (columnFilters.subscription) {
      let subName = '';
      if (industry.subscription_id && typeof industry.subscription_id === 'object') {
        subName = industry.subscription_id.name || '';
      }
      if (!subName.toLowerCase().includes(columnFilters.subscription.toLowerCase())) {
        match = false;
      }
    }
    if (columnFilters.addedBy) {
      if (!industry.addedBy || !industry.addedBy.toLowerCase().includes(columnFilters.addedBy.toLowerCase())) {
        match = false;
      }
    }
    if (columnFilters.createdAt && industry.createdAt) {
      const createdAtStr = new Date(industry.createdAt).toLocaleDateString();
      if (!createdAtStr.toLowerCase().includes(columnFilters.createdAt.toLowerCase())) {
        match = false;
      }
    }
    return match;
  });

  const totalPages = Math.ceil(filteredIndustries.length / recordsPerPage);
  const displayedIndustries = filteredIndustries.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="container">
      <h2>Manage Industries</h2>
      {/* Action Buttons Row */}
      <div className="d-flex justify-content-between mb-2">
        <button
          className={`btn btn-danger ${selectedIndustries.length === 0 ? 'disabled' : ''}`}
          onClick={() => setShowConfirmDelete(true)}
          disabled={selectedIndustries.length === 0}
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
      {/* Pagination Controls (top right) */}
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
      <IndustryTable
        industries={displayedIndustries}
        selectedIndustries={selectedIndustries}
        onRowClick={handleRowClick}
        onEditClick={handleEditClick}
        columnFilters={columnFilters}
        onColumnFilterChange={handleColumnFilterChange}
        onToggleSelectAll={toggleSelectAll}
        allSelected={allSelected}
      />
      {/* Pagination Controls (bottom right) */}
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
          message={`Are you sure you want to delete ${selectedIndustries.length} industry(ies)?`}
          onConfirm={handleDeleteIndustries}
          onCancel={() => setShowConfirmDelete(false)}
        />
      )}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingIndustry ? 'Edit Industry' : 'Add New Industry'}
                </h5>
                <button type="button" className="close" onClick={closeModal}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <IndustryForm
                  isEditing={!!editingIndustry}
                  data={industryData}
                  setData={setIndustryData}
                  onSubmit={editingIndustry ? handleUpdateIndustry : handleAddIndustry}
                  isSubmitting={false}
                  onCancel={closeModal}
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

export default IndustryPage;