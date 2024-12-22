import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchIndustries,
  createIndustry,
  updateIndustry,
  deleteIndustry,
} from '../../../reducers/industrySlice';
import IndustryForm from './IndustryForm';
import ConfirmModal from '../../ConfirmModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faPlus, faEdit } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

const IndustryPage = () => {
  const dispatch = useDispatch();
  const { industries, loading, error } = useSelector((state) => state.industries);

  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [industryData, setIndustryData] = useState({ name: '', description: '' });
  const [editingIndustry, setEditingIndustry] = useState(null);

  // Fetch industries on mount
  useEffect(() => {
    dispatch(fetchIndustries());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(`Error: ${error}`);
  }, [error]);

  const resetForm = () => {
    setIndustryData({ name: '', description: '' });
    setEditingIndustry(null);
  };

  const closeModal = () => {
    resetForm();
    setShowModal(false);
  };

  const handleRowClick = (id) => {
    setSelectedIndustries((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
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
    } catch {
      // Error handled in Redux
    }
  };

  const handleEditClick = (industry) => {
    setIndustryData({ name: industry.name, description: industry.description });
    setEditingIndustry(industry);
    setShowModal(true);
  };

  const handleUpdateIndustry = async () => {
    try {
      await dispatch(updateIndustry({ id: editingIndustry._id, industryData }));
      dispatch(fetchIndustries());
      closeModal();
    } catch {
      // Error handled in Redux
    }
  };

  const handleDeleteIndustries = async () => {
    try {
      for (const id of selectedIndustries) {
        await dispatch(deleteIndustry(id));
      }
      dispatch(fetchIndustries());
      setSelectedIndustries([]);
      setShowConfirmDelete(false);
    } catch {
      // Error handled in Redux
    }
  };

  return (
    <div className="container">
      <h2>Manage Industries</h2>
      {/* Actions */}
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="4" className="text-center">
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
              <td colSpan="4" className="text-center">
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