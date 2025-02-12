import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from '../../../reducers/subjectSlice';
import { fetchDomains } from '../../../reducers/domainSlice';
import { getSubscriptions } from '../../../auth/subscriptionActions';

import SubjectForm from './SubjectForm';
import ConfirmModal from '../../ConfirmModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faPlus, faEdit } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

const SubjectPage = () => {
  const dispatch = useDispatch();

  // Redux state
  const { subjects, loading, error } = useSelector((state) => state.subjects);
  const { domains } = useSelector((state) => state.domains);
  const { subscriptions } = useSelector((state) => state.subscription);

  // For multi-select
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  // For the delete modal
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  // For the add/edit modal
  const [showModal, setShowModal] = useState(false);

  // Subject form data
  const [subjectData, setSubjectData] = useState({
    name: '',
    domain_id: '',
    subscription_id: '',
  });
  const [editingSubject, setEditingSubject] = useState(null);

  // On mount: fetch subjects, domains, subscriptions
  useEffect(() => {
    dispatch(fetchSubjects());
    dispatch(fetchDomains());
    dispatch(getSubscriptions());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(`Error: ${error}`);
  }, [error]);

  const resetForm = () => {
    setSubjectData({ name: '', domain_id: '', subscription_id: '' });
    setEditingSubject(null);
  };

  const closeModal = () => {
    resetForm();
    setShowModal(false);
  };

  // Toggle checkbox
  const handleRowClick = (id) => {
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  // CREATE
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
    } catch {
      // error in Redux
    }
  };

  // EDIT
  const handleEditClick = (subject) => {
    setSubjectData({
      name: subject.name,
      domain_id: subject.domain_id?._id || subject.domain_id || '',
      subscription_id: subject.subscription_id?._id || subject.subscription_id || '',
    });
    setEditingSubject(subject);
    setShowModal(true);
  };

  // UPDATE
  const handleUpdateSubject = async () => {
    if (!subjectData.domain_id) {
      toast.error('Domain is required.');
      return;
    }
    try {
      await dispatch(updateSubject({ id: editingSubject._id, subjectData }));
      dispatch(fetchSubjects());
      closeModal();
    } catch {
      // error in Redux
    }
  };

  // BULK DELETE
  const handleDeleteSubjects = async () => {
    try {
      for (const id of selectedSubjects) {
        await dispatch(deleteSubject(id));
      }
      dispatch(fetchSubjects());
      setSelectedSubjects([]);
      setShowConfirmDelete(false);
    } catch {
      // error in Redux
    }
  };

  return (
    <div className="container">
      <h2>Manage Subjects</h2>

      {/* Action Buttons */}
      <div className="d-flex justify-content-between mb-3">
        <button
          className={`btn btn-danger ${selectedSubjects.length === 0 ? 'disabled' : ''}`}
          onClick={() => setShowConfirmDelete(true)}
          disabled={selectedSubjects.length === 0}
        >
          <FontAwesomeIcon icon={faTrashAlt} /> Delete Selected
        </button>
        <button
          className="btn btn-success"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <FontAwesomeIcon icon={faPlus} /> Add New Subject
        </button>
      </div>

      {/* Table */}
      <table className="table table-hover table-striped">
        <thead>
          <tr>
            <th>#</th>
            <th>Subject Name</th>
            <th>Domain</th>
            <th>Subscription</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="5" className="text-center">
                Loading subjects...
              </td>
            </tr>
          ) : subjects.length > 0 ? (
            subjects.map((subject) => {
              const domainLabel = subject.domain_id
                ? typeof subject.domain_id === 'object'
                  ? subject.domain_id.name
                  : subject.domain_id
                : '—';

              let subscriptionLabel = '—';
              if (subject.subscription_id) {
                subscriptionLabel = typeof subject.subscription_id === 'object'
                  ? subject.subscription_id.name
                  : subject.subscription_id;
              }

              return (
                <tr
                  key={subject._id}
                  className={selectedSubjects.includes(subject._id) ? 'table-primary' : ''}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(subject._id)}
                      onChange={() => handleRowClick(subject._id)}
                    />
                  </td>
                  <td>{subject.name}</td>
                  <td>{domainLabel}</td>
                  <td>{subscriptionLabel}</td>
                  <td>
                    <FontAwesomeIcon
                      icon={faEdit}
                      onClick={() => handleEditClick(subject)}
                      style={{ cursor: 'pointer', fontSize: '0.9rem' }}
                      title="Edit"
                    />
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                No subjects available.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Confirm Delete Modal */}
      {showConfirmDelete && (
        <ConfirmModal
          message={`Are you sure you want to delete ${selectedSubjects.length} subject(s)?`}
          onConfirm={handleDeleteSubjects}
          onCancel={() => setShowConfirmDelete(false)}
        />
      )}

      {/* Add/Edit Modal */}
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
                  allSubscriptions={subscriptions} // Pass the subscription list
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
