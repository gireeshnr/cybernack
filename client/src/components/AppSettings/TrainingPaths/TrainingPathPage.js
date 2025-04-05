import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTrainingPaths,
  createTrainingPath,
  updateTrainingPath,
  deleteTrainingPath,
} from '../../../reducers/trainingPathSlice';
import { fetchRoles } from '../../../reducers/roleSlice';
import { fetchSubjects } from '../../../reducers/subjectSlice';
import { getSubscriptions } from '../../../auth/subscriptionActions';

import TrainingPathForm from './TrainingPathForm';
import TrainingPathTable from './TrainingPathTable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faPlus, faChevronLeft, faChevronRight, faClone } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

const TrainingPathPage = () => {
  const dispatch = useDispatch();
  const { trainingPaths, loading, error } = useSelector((state) => state.trainingPath);
  const { roles } = useSelector((state) => state.roles);
  const { subjects } = useSelector((state) => state.subjects);
  const { subscriptions } = useSelector((state) => state.subscription);
  const { profile } = useSelector((state) => state.auth);

  const isSuperadmin = profile?.role?.toLowerCase() === 'superadmin';

  // For local admin, subscription is inherited from the organization
  const localSubscriptionName = !isSuperadmin
    ? profile?.organization?.subscription?.name || ''
    : '';

  // Tabs: "global" vs "local"
  const [activeTab, setActiveTab] = useState('global');
  const [selectedIds, setSelectedIds] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPath, setEditingPath] = useState(null);

  const [formData, setFormData] = useState({
    subscription: isSuperadmin ? '' : localSubscriptionName,
    name: '',
    description: '',
    role_ids: [],
    subjectMappings: [],
  });

  // Column filters
  const [columnFilters, setColumnFilters] = useState({
    name: '',
    description: '',
    role: '',
    subjects: '',
    addedBy: '',
    createdAt: '',
    subscription: '',
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Load data on mount
  useEffect(() => {
    dispatch(fetchTrainingPaths());
    dispatch(fetchRoles());
    dispatch(getSubscriptions());
    if (!isSuperadmin) {
      const subId = profile?.organization?.subscription?._id;
      if (subId) {
        dispatch(fetchSubjects(subId));
      }
    }
  }, [dispatch, isSuperadmin, profile]);

  // For superadmin, if the form subscription changes, fetch subjects for that subscription
  useEffect(() => {
    if (isSuperadmin && formData.subscription) {
      dispatch(fetchSubjects(formData.subscription));
    }
  }, [dispatch, isSuperadmin, formData.subscription]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [columnFilters]);

  // Separate global (organization_id===null) vs local (organization_id!==null) training paths
  const globalPaths = trainingPaths.filter((tp) => tp.organization_id === null);
  const localPaths = trainingPaths.filter((tp) => tp.organization_id !== null);
  const relevantPaths = activeTab === 'global' ? globalPaths : localPaths;

  // Apply column filters
  const filteredPaths = relevantPaths.filter((tp) => {
    let match = true;
    if (columnFilters.name && !tp.name.toLowerCase().includes(columnFilters.name.toLowerCase())) match = false;
    if (columnFilters.description && (!tp.description || !tp.description.toLowerCase().includes(columnFilters.description.toLowerCase()))) match = false;
    if (columnFilters.role && Array.isArray(tp.role_ids)) {
      const roleNames = tp.role_ids.map((r) => (typeof r === 'object' ? r.name : ''));
      if (!roleNames.join(', ').toLowerCase().includes(columnFilters.role.toLowerCase())) match = false;
    }
    if (columnFilters.subjects) {
      const subStr = (tp.subjectMappings || [])
        .map((m) => m.subject_id?.name || '')
        .join(', ')
        .toLowerCase();
      if (!subStr.includes(columnFilters.subjects.toLowerCase())) match = false;
    }
    if (columnFilters.addedBy && tp.addedBy) {
      if (!tp.addedBy.toLowerCase().includes(columnFilters.addedBy.toLowerCase())) match = false;
    }
    if (columnFilters.createdAt && tp.createdAt) {
      const dateStr = new Date(tp.createdAt).toLocaleDateString();
      if (!dateStr.includes(columnFilters.createdAt)) match = false;
    }
    if (isSuperadmin && columnFilters.subscription) {
      if (!tp.subscription?.toLowerCase().includes(columnFilters.subscription.toLowerCase())) match = false;
    }
    return match;
  });

  const totalPages = Math.ceil(filteredPaths.length / recordsPerPage);
  const displayedPaths = filteredPaths.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  // Row selection handler
  const handleRowClick = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
      setAllSelected(false);
    } else {
      const visibleIds = displayedPaths.map((tp) => tp._id);
      setSelectedIds(visibleIds);
      setAllSelected(true);
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setSelectedIds([]);
    setAllSelected(false);
  };

  // For edit: 
  // • For superadmin: allow edit only on global training paths (organization_id===null)
  // • For local admin: allow edit only on local training paths (organization_id !== null)
  const handleEditClick = (tp) => {
    if (isSuperadmin) {
      if (tp.organization_id !== null) {
        toast.error("Superadmin cannot edit local training paths.");
        return;
      }
    } else {
      if (tp.organization_id === null) {
        toast.error("Local admin cannot edit global training paths.");
        return;
      }
    }
    openModal(tp);
  };

  // Clone functionality: allowed for superadmin (global and local) and for local admin (on their own)
  const handleCloneClick = (tp) => {
    const clonedData = {
      subscription: isSuperadmin ? '' : localSubscriptionName,
      name: tp.name + '_clone',
      description: tp.description,
      role_ids: Array.isArray(tp.role_ids)
        ? tp.role_ids.map((r) => (typeof r === 'object' ? r._id : r))
        : [],
      subjectMappings: Array.isArray(tp.subjectMappings)
        ? tp.subjectMappings.map((m) => (typeof m.subject_id === 'object' ? m.subject_id._id : m.subject_id))
        : [],
    };
    setEditingPath(null);
    setFormData(clonedData);
    setShowModal(true);
  };

  const openModal = (tp = null) => {
    if (tp) {
      setEditingPath(tp);
      let subscriptionValue = tp.subscription;
      if (isSuperadmin && subscriptionValue) {
        const subObj = subscriptions.find((s) => s.name === subscriptionValue);
        subscriptionValue = subObj ? subObj._id : '';
      }
      setFormData({
        subscription: subscriptionValue || (isSuperadmin ? '' : localSubscriptionName),
        name: tp.name,
        description: tp.description || '',
        role_ids: Array.isArray(tp.role_ids)
          ? tp.role_ids.map((r) => (typeof r === 'object' ? r._id : r))
          : [],
        subjectMappings: Array.isArray(tp.subjectMappings)
          ? tp.subjectMappings.map((m) => (typeof m.subject_id === 'object' ? m.subject_id._id : m.subject_id))
          : [],
      });
    } else {
      setEditingPath(null);
      setFormData({
        subscription: isSuperadmin ? '' : localSubscriptionName,
        name: '',
        description: '',
        role_ids: [],
        subjectMappings: [],
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPath(null);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        subscription: formData.subscription,
        name: formData.name,
        description: formData.description,
        role_ids: formData.role_ids || [],
        subjectMappings: (formData.subjectMappings || []).map((sid) => ({
          subject_id: sid,
          isMandatory: false,
        })),
      };
      if (!editingPath) {
        await dispatch(createTrainingPath(payload));
        toast.success('Training path created!');
      } else {
        await dispatch(updateTrainingPath({ id: editingPath._id, trainingPathData: payload }));
        toast.success('Training path updated!');
      }
      setShowModal(false);
      setEditingPath(null);
    } catch (err) {
      console.error('Error saving training path:', err);
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Error saving training path.');
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Delete ${selectedIds.length} training path(s)?`)) return;
    for (const id of selectedIds) {
      await dispatch(deleteTrainingPath(id));
    }
    toast.success(`Deleted ${selectedIds.length} record(s)!`);
    setSelectedIds([]);
    setAllSelected(false);
  };

  const handleColumnFilterChange = (column, value) => {
    setColumnFilters((prev) => ({ ...prev, [column]: value }));
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="container mt-3">
      <h2>Manage Training Paths</h2>

      {/* Top Buttons */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <button
          className={`btn btn-danger ${selectedIds.length === 0 ? 'disabled' : ''}`}
          onClick={handleDeleteSelected}
          disabled={selectedIds.length === 0}
          title="Delete Selected"
        >
          <FontAwesomeIcon icon={faTrashAlt} />
        </button>
        {((isSuperadmin && activeTab === 'global') || (!isSuperadmin && activeTab === 'local')) && (
          <button
            className="btn btn-success"
            onClick={() => openModal(null)}
            title="Add New Training Path"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        )}
      </div>

      {/* Tabs and Pagination */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'global' ? 'active' : ''}`}
              onClick={() => handleTabClick('global')}
            >
              Global
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'local' ? 'active' : ''}`}
              onClick={() => handleTabClick('local')}
            >
              Local
            </button>
          </li>
        </ul>
        <div>
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            style={{ background: 'transparent', border: 'none' }}
            title="Previous Page"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <span className="mx-2">
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
      </div>

      {/* Table */}
      <TrainingPathTable
        trainingPaths={displayedPaths}
        selectedTrainingPaths={selectedIds}
        onRowClick={handleRowClick}
        onEditClick={handleEditClick}
        onCloneClick={isSuperadmin ? handleCloneClick : null}
        columnFilters={columnFilters}
        onColumnFilterChange={handleColumnFilterChange}
        onToggleSelectAll={toggleSelectAll}
        allSelected={allSelected}
        showSubscriptionColumn={isSuperadmin}
        isSuperadmin={isSuperadmin}
      />

      <div className="d-flex justify-content-end mt-2">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          style={{ background: 'transparent', border: 'none' }}
          title="Previous Page"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <span className="mx-2">
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

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1} role="dialog">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <TrainingPathForm
                isEditing={!!editingPath}
                data={formData}
                setData={setFormData}
                onSubmit={handleSubmit}
                isSubmitting={loading}
                onCancel={closeModal}
                allRoles={roles}
                allSubjects={subjects}
                allSubscriptions={subscriptions}
                isSuperadmin={isSuperadmin}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingPathPage;