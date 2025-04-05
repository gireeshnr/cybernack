// client/src/components/AppSettings/Industries/IndustryPage.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIndustries, createIndustry, updateIndustry, deleteIndustry } from '../../../reducers/industrySlice';
import { getSubscriptions } from '../../../auth/subscriptionActions';
import IndustryForm from './IndustryForm';
import IndustryTable from './IndustryTable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faPlus, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

const IndustryPage = () => {
  const dispatch = useDispatch();
  const { industries, loading, error } = useSelector((state) => state.industries);
  const { subscriptions } = useSelector((state) => state.subscription);
  const { profile } = useSelector((state) => state.auth);

  const isSuperadmin = profile?.role?.toLowerCase() === 'superadmin';
  const organizationId = profile?.organization?._id;

  // Use creatorRole to decide tab filtering: global (creatorRole === 'superadmin') or local (creatorRole === 'admin')
  const [activeTab, setActiveTab] = useState('global');
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [industryData, setIndustryData] = useState({
    name: '',
    description: '',
    subscription_id: isSuperadmin ? '' : '',
  });
  const [editingIndustry, setEditingIndustry] = useState(null);

  const [columnFilters, setColumnFilters] = useState({
    name: '',
    description: '',
    subscription: '',
    addedBy: '',
    createdAt: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    dispatch(fetchIndustries());
    dispatch(getSubscriptions());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    setCurrentPage(1);
  }, [columnFilters, activeTab]);

  const resetForm = () => {
    setIndustryData({ name: '', description: '', subscription_id: isSuperadmin ? '' : '' });
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
      const allIds = filteredIndustries.map((ind) => ind._id);
      setSelectedIndustries(allIds);
      setAllSelected(true);
    }
  };

  const handleAddIndustry = async () => {
    if (!industryData.name) {
      toast.error('Industry name is required.');
      return;
    }
    const payload = { ...industryData };
    if (!isSuperadmin) {
      payload.ownerOrgId = organizationId;
    }
    try {
      await dispatch(createIndustry(payload));
      dispatch(fetchIndustries());
      closeModal();
    } catch (err) {
      toast.error('Failed to create industry');
    }
  };

  const handleUpdateIndustry = async () => {
    const payload = { ...industryData };
    if (!isSuperadmin) {
      payload.ownerOrgId = organizationId;
    }
    try {
      await dispatch(updateIndustry({ id: editingIndustry._id, industryData: payload }));
      dispatch(fetchIndustries());
      closeModal();
    } catch (err) {
      toast.error('Failed to update industry');
    }
  };

  const handleDeleteIndustries = async () => {
    if (!selectedIndustries.length) return;
    if (!window.confirm(`Delete ${selectedIndustries.length} industry(ies)?`)) return;
    try {
      for (const id of selectedIndustries) {
        await dispatch(deleteIndustry(id));
      }
      toast.success(`Deleted ${selectedIndustries.length} record(s)!`);
      setSelectedIndustries([]);
      setAllSelected(false);
      dispatch(fetchIndustries());
    } catch (err) {
      toast.error('Failed to delete industries');
    }
  };

  const handleEditClick = (industry) => {
    // Prevent editing global records for non‑superadmins.
    if (!isSuperadmin && industry.creatorRole === 'superadmin') {
      toast.error('You cannot edit global records');
      return;
    }
    setEditingIndustry(industry);
    setIndustryData({
      name: industry.name,
      description: industry.description || '',
      subscription_id:
        industry.subscription_id && typeof industry.subscription_id === 'object'
          ? industry.subscription_id._id
          : industry.subscription_id || '',
    });
    setShowModal(true);
  };

  const handleColumnFilterChange = (column, value) => {
    setColumnFilters((prev) => ({ ...prev, [column]: value }));
    setCurrentPage(1);
  };

  // Filter industries based on the active tab.
  const filteredIndustries = industries.filter((ind) => {
    let match = true;
    if (activeTab === 'global') {
      match = ind.creatorRole === 'superadmin';
    } else {
      if (isSuperadmin) {
        match = ind.creatorRole === 'admin';
      } else {
        match = ind.creatorRole === 'admin' && ind.ownerOrgId && ind.ownerOrgId.toString() === organizationId.toString();
      }
    }
    if (columnFilters.name && !ind.name.toLowerCase().includes(columnFilters.name.toLowerCase())) {
      match = false;
    }
    if (columnFilters.description && (!ind.description || !ind.description.toLowerCase().includes(columnFilters.description.toLowerCase()))) {
      match = false;
    }
    if (columnFilters.subscription && ind.subscription_id && typeof ind.subscription_id === 'object') {
      const subName = ind.subscription_id.name || '';
      if (!subName.toLowerCase().includes(columnFilters.subscription.toLowerCase())) {
        match = false;
      }
    }
    if (columnFilters.addedBy && (!ind.addedBy || !ind.addedBy.toLowerCase().includes(columnFilters.addedBy.toLowerCase()))) {
      match = false;
    }
    if (columnFilters.createdAt && ind.createdAt && !new Date(ind.createdAt).toLocaleDateString().toLowerCase().includes(columnFilters.createdAt.toLowerCase())) {
      match = false;
    }
    return match;
  });

  const totalPages = Math.ceil(filteredIndustries.length / recordsPerPage);
  const displayedIndustries = filteredIndustries.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="container mt-3">
      <h2>Manage Industries</h2>
      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'global' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('global');
              setSelectedIndustries([]);
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
              setSelectedIndustries([]);
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
            className={`btn btn-danger ${selectedIndustries.length === 0 ? 'disabled' : ''}`}
            onClick={handleDeleteIndustries}
            disabled={selectedIndustries.length === 0}
          >
            <FontAwesomeIcon icon={faTrashAlt} />
          </button>
        )}
        {((activeTab === 'global' && isSuperadmin) || (activeTab === 'local' && !isSuperadmin)) && (
          <button className="btn btn-success" onClick={() => { resetForm(); setShowModal(true); }}>
            <FontAwesomeIcon icon={faPlus} />
          </button>
        )}
      </div>

      {/* Top Pagination */}
      <div className="d-flex justify-content-end mb-2">
        <button onClick={handlePreviousPage} disabled={currentPage === 1} style={{ background: 'transparent', border: 'none' }} title="Previous Page">
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <span className="align-self-center mx-2">
          {currentPage} / {totalPages || 1}
        </span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages || totalPages === 0} style={{ background: 'transparent', border: 'none' }} title="Next Page">
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
        isSuperadmin={isSuperadmin}
      />

      {/* Bottom Pagination */}
      <div className="d-flex justify-content-end mt-2">
        <button onClick={handlePreviousPage} disabled={currentPage === 1} style={{ background: 'transparent', border: 'none' }} title="Previous Page">
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <span className="align-self-center mx-2">
          {currentPage} / {totalPages || 1}
        </span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages || totalPages === 0} style={{ background: 'transparent', border: 'none' }} title="Next Page">
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingIndustry ? 'Edit Industry' : 'Add New Industry'}</h5>
                <button type="button" className="close" onClick={closeModal} style={{ background: 'none', border: 'none' }}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <IndustryForm
                  isEditing={!!editingIndustry}
                  data={industryData}
                  setData={setIndustryData}
                  onSubmit={editingIndustry ? handleUpdateIndustry : handleAddIndustry}
                  isSubmitting={loading}
                  onCancel={closeModal}
                  allSubscriptions={subscriptions}
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

export default IndustryPage;