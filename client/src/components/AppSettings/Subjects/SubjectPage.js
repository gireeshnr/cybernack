import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSubjects, createSubject, updateSubject, deleteSubject } from '../../../reducers/subjectSlice';
import { fetchDomains } from '../../../reducers/domainSlice';
import { getSubscriptions } from '../../../auth/subscriptionActions';
import SubjectForm from './SubjectForm';
import ConfirmModal from '../../ConfirmModal';
import SubjectTable from './SubjectTable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faPlus, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

const SubjectPage = () => {
  const dispatch = useDispatch();
  const { subjects, loading, error } = useSelector((state) => state.subjects);
  const { domains } = useSelector((state) => state.domains);
  const { subscriptions } = useSelector((state) => state.subscription);

  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [subjectData, setSubjectData] = useState({
    name: '',
    domain_id: '',
    subscription_id: '',
  });
  const [editingSubject, setEditingSubject] = useState(null);

  // Column filters
  const [columnFilters, setColumnFilters] = useState({
    name: '',
    domain: '',
    subscription: '',
    addedBy: '',
    createdAt: '',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    dispatch(fetchSubjects());
    dispatch(fetchDomains());
    dispatch(getSubscriptions());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(`Error: ${error}`);
  }, [error]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [columnFilters]);

  const resetForm = () => {
    setSubjectData({ name: '', domain_id: '', subscription_id: '' });
    setEditingSubject(null);
  };

  const closeModal = () => {
    resetForm();
    setShowModal(false);
  };

  const handleRowClick = (id) => {
    if (selectedSubjects.includes(id)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s !== id));
    } else {
      setSelectedSubjects([...selectedSubjects, id]);
    }
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedSubjects([]);
      setAllSelected(false);
    } else {
      const allIds = filteredSubjects.map((s) => s._id);
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
      toast.error('Domain is required.');
      return;
    }
    try {
      await dispatch(createSubject(subjectData));
      dispatch(fetchSubjects());
      closeModal();
    } catch {}
  };

  const handleUpdateSubject = async () => {
    if (!subjectData.domain_id) {
      toast.error('Domain is required.');
      return;
    }
    try {
      await dispatch(updateSubject({ id: editingSubject._id, subjectData }));
      dispatch(fetchSubjects());
      closeModal();
    } catch {}
  };

  const handleDeleteSubjects = async () => {
    try {
      for (const id of selectedSubjects) {
        await dispatch(deleteSubject(id));
      }
      dispatch(fetchSubjects());
      setSelectedSubjects([]);
      setAllSelected(false);
      setShowConfirmDelete(false);
    } catch {}
  };

  const handleEditClick = (subject) => {
    setSubjectData({
      name: subject.name,
      domain_id: subject.domain_id && typeof subject.domain_id === 'object'
        ? subject.domain_id._id
        : subject.domain_id || '',
      subscription_id:
        subject.subscription_id && typeof subject.subscription_id === 'object'
          ? subject.subscription_id._id
          : subject.subscription_id || '',
    });
    setEditingSubject(subject);
    setShowModal(true);
  };

  const handleColumnFilterChange = (column, value) => {
    setColumnFilters((prev) => ({ ...prev, [column]: value }));
  };

  const filteredSubjects = subjects.filter((subject) => {
    let match = true;
    if (columnFilters.name && !subject.name.toLowerCase().includes(columnFilters.name.toLowerCase())) {
      match = false;
    }
    if (columnFilters.domain) {
      let domainName = '';
      if (subject.domain_id && typeof subject.domain_id === 'object') {
        domainName = subject.domain_id.name || '';
      }
      if (!domainName.toLowerCase().includes(columnFilters.domain.toLowerCase())) {
        match = false;
      }
    }
    if (columnFilters.subscription) {
      let subName = '';
      if (subject.subscription_id && typeof subject.subscription_id === 'object') {
        subName = subject.subscription_id.name || '';
      }
      if (!subName.toLowerCase().includes(columnFilters.subscription.toLowerCase())) {
        match = false;
      }
    }
    if (columnFilters.addedBy) {
      if (!subject.addedBy || !subject.addedBy.toLowerCase().includes(columnFilters.addedBy.toLowerCase())) {
        match = false;
      }
    }
    if (columnFilters.createdAt && subject.createdAt) {
      const createdAtStr = new Date(subject.createdAt).toLocaleDateString();
      if (!createdAtStr.toLowerCase().includes(columnFilters.createdAt.toLowerCase())) {
        match = false;
      }
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
    <div className="container">
      <h2>Manage Subjects</h2>

      {/* Action Buttons Row */}
      <div className="d-flex justify-content-between mb-2">
        <button
          className={`btn btn-danger ${selectedSubjects.length === 0 ? 'disabled' : ''}`}
          onClick={() => setShowConfirmDelete(true)}
          disabled={selectedSubjects.length === 0}
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

      {/* Subject Table */}
      <SubjectTable
        subjects={displayedSubjects}
        selectedSubjects={selectedSubjects}
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
          message={`Are you sure you want to delete ${selectedSubjects.length} subject(s)?`}
          onConfirm={handleDeleteSubjects}
          onCancel={() => setShowConfirmDelete(false)}
        />
      )}

      {showModal && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingSubject ? 'Edit Subject' : 'Add New Subject'}
                </h5>
                <button type="button" className="close" onClick={closeModal}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <SubjectForm
                  isEditing={!!editingSubject}
                  data={subjectData}
                  setData={setSubjectData}
                  onSubmit={editingSubject ? handleUpdateSubject : handleAddSubject}
                  isSubmitting={false}
                  onCancel={closeModal}
                  allDomains={domains}
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

export default SubjectPage;