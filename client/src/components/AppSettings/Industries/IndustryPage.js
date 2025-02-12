// client/src/components/AppSettings/Industries/IndustryPage.js

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchIndustries,
  createIndustry,
  updateIndustry,
  deleteIndustry,
} from '../../../reducers/industrySlice';

// Import from your existing subscriptionActions
import { getSubscriptions } from '../../../auth/subscriptionActions';

import IndustryForm from './IndustryForm';
import ConfirmModal from '../../ConfirmModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faPlus, faEdit } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

const IndustryPage = () => {
  const dispatch = useDispatch();

  // Redux state for industries
  const { industries, loading, error } = useSelector((state) => state.industries);

  // Redux state for subscriptions
  // NOTE: Adjust if your combined reducer key is different
  const { subscriptions } = useSelector((state) => state.subscription);

  // Local state
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Industry form data includes subscription_id
  const [industryData, setIndustryData] = useState({
    name: '',
    description: '',
    subscription_id: '', // for the dropdown
  });
  const [editingIndustry, setEditingIndustry] = useState(null);

  // Fetch industries & subscriptions on mount
  useEffect(() => {
    dispatch(fetchIndustries());
    dispatch(getSubscriptions()); // existing action from subscriptionActions.js
  }, [dispatch]);

  // If there's an error from Redux, show via toast
  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error}`);
    }
  }, [error]);

  const resetForm = () => {
    setIndustryData({ name: '', description: '', subscription_id: '' });
    setEditingIndustry(null);
  };

  const closeModal = () => {
    resetForm();
    setShowModal(false);
  };

  // Toggle selection for bulk delete
  const handleRowClick = (id) => {
    setSelectedIndustries((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // CREATE
  const handleAddIndustry = async () => {
    if (!industryData.name) {
      toast.error('Industry name is required.');
      return;
    }
    try {
      await dispatch(createIndustry(industryData));
      dispatch(fetchIndustries());
      closeModal();
    } catch {
      // error handled in Redux
    }
  };

  // EDIT
  const handleEditClick = (industry) => {
    setIndustryData({
      name: industry.name,
      description: industry.description || '',
      // if subscription_id is an object, use _id
      subscription_id:
        (industry.subscription_id && industry.subscription_id._id) ||
        industry.subscription_id ||
        '',
    });
    setEditingIndustry(industry);
    setShowModal(true);
  };

  // UPDATE
  const handleUpdateIndustry = async () => {
    try {
      await dispatch(updateIndustry({ id: editingIndustry._id, industryData }));
      dispatch(fetchIndustries());
      closeModal();
    } catch {
      // error handled in Redux
    }
  };

  // BULK DELETE
  const handleDeleteIndustries = async () => {
    try {
      for (const id of selectedIndustries) {
        await dispatch(deleteIndustry(id));
      }
      dispatch(fetchIndustries());
      setSelectedIndustries([]);
      setShowConfirmDelete(false);
    } catch {
      // error handled in Redux
    }
  };

  return (
    <div className="container">
      <h2>Manage Industries</h2>

      {/* Action Buttons */}
      <div className="d-flex justify-content-between mb-3">
        <button
          className={`btn btn-danger ${selectedIndustries.length === 0 ? 'disabled' : ''}`}
          onClick={() => setShowConfirmDelete(true)}
          disabled={selectedIndustries.length === 0}
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
          <FontAwesomeIcon icon={faPlus} /> Add New Industry
        </button>
      </div>

      {/* Table */}
      <table className="table table-hover table-striped">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Description</th>
            <th>Subscription</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="5" className="text-center">
                Loading industries...
              </td>
            </tr>
          ) : industries.length > 0 ? (
            industries.map((industry) => (
              <tr
                key={industry._id}
                className={selectedIndustries.includes(industry._id) ? 'table-primary' : ''}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIndustries.includes(industry._id)}
                    onChange={() => handleRowClick(industry._id)}
                  />
                </td>
                <td>{industry.name}</td>
                <td>{industry.description}</td>
                <td>
                  {industry.subscription_id && typeof industry.subscription_id === 'object'
                    ? industry.subscription_id.name
                    : industry.subscription_id || '—'}
                </td>
                <td>
                  <FontAwesomeIcon
                    icon={faEdit}
                    onClick={() => handleEditClick(industry)}
                    style={{ cursor: 'pointer', fontSize: '0.9rem' }}
                    title="Edit"
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                No industries available.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Confirm Delete Modal */}
      {showConfirmDelete && (
        <ConfirmModal
          message={`Are you sure you want to delete ${selectedIndustries.length} industry(ies)?`}
          onConfirm={handleDeleteIndustries}
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
                  allSubscriptions={subscriptions} // pass subscription array to form
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
