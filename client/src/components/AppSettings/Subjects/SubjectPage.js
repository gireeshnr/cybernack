// client/src/components/AppSettings/Subjects/SubjectPage.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSubjects, createSubject, updateSubject, deleteSubject } from '../../../reducers/subjectSlice';
import { fetchDomains } from '../../../reducers/domainSlice';
import { getSubscriptions } from '../../../auth/subscriptionActions';
import SubjectForm from './SubjectForm';
import SubjectTable from './SubjectTable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faPlus, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

// Utility functions to normalize subscription names and determine level.
function normalizeSubName(rawName) {
  if (!rawName) return '';
  return rawName.trim().toLowerCase();
}

function getSubLevel(rawName) {
  const name = normalizeSubName(rawName);
  switch (name) {
    case 'free': return 1;
    case 'standard': return 2;
    case 'enterprise': return 3;
    default: return 0;
  }
}

const SubjectPage = () => {
  const dispatch = useDispatch();
  const { subjects, loading, error } = useSelector(state => state.subjects);
  const { domains } = useSelector(state => state.domains);
  const { subscriptions } = useSelector(state => state.subscription);
  const { profile } = useSelector(state => state.auth);

  const isSuperadmin = profile?.role?.toLowerCase() === 'superadmin';
  const organizationId = profile?.organization?._id;
  const orgSubscription = profile?.organization?.subscription?.name || 'Free';

  const [activeTab, setActiveTab] = useState('global');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [subjectData, setSubjectData] = useState({
    name: '',
    description: '',
    domain_id: '',
    subscription_id: isSuperadmin ? '' : '', // For local admin, will be auto-set.
  });
  const [editingSubject, setEditingSubject] = useState(null);
  const [columnFilters, setColumnFilters] = useState({
    name: '',
    description: '',
    domain: '',
    subscription: '',
    addedBy: '',
    createdAt: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    dispatch(fetchSubjects());
    dispatch(getSubscriptions());
    dispatch(fetchDomains());
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
    setSubjectData({ name: '', description: '', domain_id: '', subscription_id: isSuperadmin ? '' : '' });
    setEditingSubject(null);
  };

  const closeModal = () => {
    resetForm();
    setShowModal(false);
  };

  const handleRowClick = (id) => {
    if (selectedSubjects.includes(id)) {
      setSelectedSubjects(selectedSubjects.filter(item => item !== id));
    } else {
      setSelectedSubjects([...selectedSubjects, id]);
    }
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedSubjects([]);
      setAllSelected(false);
    } else {
      const allIds = filteredSubjects.map(s => s._id);
      setSelectedSubjects(allIds);
      setAllSelected(true);
    }
  };

  const handleAddSubject = async () => {
    if (!subjectData.name) {
      toast.error('Subject name is required.');
      return;
    }
    if (!subjectData.domain_id) {
      toast.error('Domain selection is required.');
      return;
    }
    const payload = { ...subjectData };
    if (!isSuperadmin) {
      payload.subscription_id = profile.organization.subscription?._id || '';
      payload.ownerOrgId = organizationId;
    }
    try {
      await dispatch(createSubject(payload));
      dispatch(fetchSubjects());
      closeModal();
    } catch (err) {
      toast.error('Failed to create subject');
    }
  };

  const handleUpdateSubject = async () => {
    if (!subjectData.domain_id) {
      toast.error('Domain selection is required.');
      return;
    }
    const payload = { ...subjectData };
    if (!isSuperadmin) {
      payload.subscription_id = profile.organization.subscription?._id || '';
      payload.ownerOrgId = organizationId;
    }
    try {
      await dispatch(updateSubject({ id: editingSubject._id, subjectData: payload }));
      dispatch(fetchSubjects());
      closeModal();
    } catch (err) {
      toast.error('Failed to update subject');
    }
  };

  const handleDeleteSubjects = async () => {
    if (!selectedSubjects.length) return;
    if (!window.confirm(`Delete ${selectedSubjects.length} subject(s)?`)) return;
    try {
      for (const id of selectedSubjects) {
        await dispatch(deleteSubject(id));
      }
      toast.success(`Deleted ${selectedSubjects.length} record(s)!`);
      setSelectedSubjects([]);
      setAllSelected(false);
      dispatch(fetchSubjects());
    } catch (err) {
      toast.error('Failed to delete subjects');
    }
  };

  const handleEditClick = (subject) => {
    if (!isSuperadmin && subject.creatorRole === 'superadmin') {
      toast.error('You cannot edit global records');
      return;
    }
    setEditingSubject(subject);
    setSubjectData({
      name: subject.name,
      description: subject.description || '',
      domain_id: subject.domain_id && typeof subject.domain_id === 'object'
        ? subject.domain_id._id
        : subject.domain_id || '',
      subscription_id: subject.subscription_id && typeof subject.subscription_id === 'object'
        ? subject.subscription_id._id
        : subject.subscription_id || '',
    });
    setShowModal(true);
  };

  const handleColumnFilterChange = (column, value) => {
    setColumnFilters(prev => ({ ...prev, [column]: value }));
    setCurrentPage(1);
  };

  // Updated getFilteredDomains:
  // - For superadmin: if a subscription is selected, return only global domains (creatorRole 'superadmin')
  //   whose subscription exactly matches the selected subscription.
  // - For local admin: show all domains belonging to their organization (creatorRole 'admin' with matching ownerOrgId)
  //   where the domain's subscription level is less than or equal to the organization's subscription level.
  const getFilteredDomains = () => {
    if (isSuperadmin) {
      const subId = subjectData.subscription_id; // Corrected variable (using subjectData here because subjectData is used for the subject form)
      if (!subId) return [];
      const selectedSub = subscriptions.find(s => s._id === subId);
      const selectedSubName = selectedSub ? selectedSub.name : 'Free';
      return domains.filter(domain => {
        if (domain.creatorRole !== 'superadmin') return false;
        const domainSubName = domain.subscription_id && typeof domain.subscription_id === 'object'
          ? domain.subscription_id.name || 'Free'
          : 'Free';
        return domainSubName === selectedSubName;
      });
    } else {
      const orgSubscriptionName = profile.organization.subscription?.name || 'Free';
      const orgSubLevel = getSubLevel(orgSubscriptionName);
      return domains.filter(domain => {
        if (domain.creatorRole !== 'admin' || !domain.ownerOrgId || domain.ownerOrgId.toString() !== organizationId.toString()) {
          return false;
        }
        const domainSubName = domain.subscription_id && typeof domain.subscription_id === 'object'
          ? domain.subscription_id.name || 'Free'
          : 'Free';
        const recLevel = getSubLevel(domainSubName);
        return recLevel <= orgSubLevel;
      });
    }
  };

  // Filter subjects based on activeTab (global vs. local) and other column filters.
  const filteredSubjects = subjects.filter(sub => {
    let match = true;
    if (activeTab === 'global') {
      match = sub.creatorRole === 'superadmin';
    } else {
      if (isSuperadmin) {
        match = sub.creatorRole === 'admin';
      } else {
        match = sub.creatorRole === 'admin' && sub.ownerOrgId && sub.ownerOrgId.toString() === organizationId.toString();
      }
    }
    if (columnFilters.name && !sub.name.toLowerCase().includes(columnFilters.name.toLowerCase())) {
      match = false;
    }
    if (columnFilters.description && (!sub.description || !sub.description.toLowerCase().includes(columnFilters.description.toLowerCase()))) {
      match = false;
    }
    if (columnFilters.domain) {
      const domainName = sub.domain_id && typeof sub.domain_id === 'object' ? sub.domain_id.name || '' : '';
      if (!domainName.toLowerCase().includes(columnFilters.domain.toLowerCase())) {
        match = false;
      }
    }
    if (isSuperadmin && columnFilters.subscription) {
      const subName = sub.subscription_id && typeof sub.subscription_id === 'object' ? sub.subscription_id.name || '' : '';
      if (!subName.toLowerCase().includes(columnFilters.subscription.toLowerCase())) {
        match = false;
      }
    }
    if (columnFilters.addedBy && (!sub.addedBy || !sub.addedBy.toLowerCase().includes(columnFilters.addedBy.toLowerCase()))) {
      match = false;
    }
    if (columnFilters.createdAt && sub.createdAt && !new Date(sub.createdAt).toLocaleDateString().toLowerCase().includes(columnFilters.createdAt.toLowerCase())) {
      match = false;
    }
    return match;
  });

  const totalPages = Math.ceil(filteredSubjects.length / recordsPerPage);
  const displayedSubjects = filteredSubjects.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="container mt-3">
      <h2>Manage Subjects</h2>
      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'global' ? 'active' : ''}`}
            onClick={() => { setActiveTab('global'); setSelectedSubjects([]); setAllSelected(false); }}
          >
            Global
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'local' ? 'active' : ''}`}
            onClick={() => { setActiveTab('local'); setSelectedSubjects([]); setAllSelected(false); }}
          >
            Local
          </button>
        </li>
      </ul>

      {/* Action Buttons */}
      <div className="d-flex justify-content-between mb-2">
        {(activeTab === 'local' || isSuperadmin) && (
          <button
            className={`btn btn-danger ${selectedSubjects.length === 0 ? 'disabled' : ''}`}
            onClick={handleDeleteSubjects}
            disabled={selectedSubjects.length === 0}
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
        <button onClick={handlePreviousPage} disabled={currentPage === 1}
          style={{ background: 'transparent', border: 'none' }} title="Previous Page">
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <span className="align-self-center mx-2">{currentPage} / {totalPages || 1}</span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages || totalPages === 0}
          style={{ background: 'transparent', border: 'none' }} title="Next Page">
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>

      <SubjectTable
        subjects={displayedSubjects}
        selectedSubjects={selectedSubjects}
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
        <button onClick={handlePreviousPage} disabled={currentPage === 1}
          style={{ background: 'transparent', border: 'none' }} title="Previous Page">
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <span className="align-self-center mx-2">{currentPage} / {totalPages || 1}</span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages || totalPages === 0}
          style={{ background: 'transparent', border: 'none' }} title="Next Page">
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingSubject ? 'Edit Subject' : 'Add New Subject'}</h5>
                <button type="button" className="close" onClick={closeModal}
                  style={{ background: 'none', border: 'none' }}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <SubjectForm
                  isEditing={!!editingSubject}
                  data={subjectData}
                  setData={setSubjectData}
                  onSubmit={editingSubject ? handleUpdateSubject : handleAddSubject}
                  isSubmitting={loading}
                  onCancel={closeModal}
                  allSubscriptions={subscriptions}
                  allDomains={getFilteredDomains()}
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

export default SubjectPage;