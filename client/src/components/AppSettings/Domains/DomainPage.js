import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDomains,
  createDomain,
  updateDomain,
  deleteDomain,
} from '../../../reducers/domainSlice';
import { fetchIndustries } from '../../../reducers/industrySlice';

// Import your subscription action
import { getSubscriptions } from '../../../auth/subscriptionActions';

import DomainForm from './DomainForm';
import ConfirmModal from '../../ConfirmModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faPlus, faEdit } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

const DomainPage = () => {
  const dispatch = useDispatch();
  const { domains, loading, error } = useSelector((state) => state.domains);
  const { industries } = useSelector((state) => state.industries);

  // Redux state for subscriptions
  const { subscriptions } = useSelector((state) => state.subscription);

  const [selectedDomains, setSelectedDomains] = useState([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Domain form data
  const [domainData, setDomainData] = useState({
    name: '',
    description: '',
    industries: [],
    subscription_id: '', // NEW
  });
  const [editingDomain, setEditingDomain] = useState(null);

  // Fetch domains, industries, subscriptions on mount
  useEffect(() => {
    dispatch(fetchDomains());
    dispatch(fetchIndustries());
    dispatch(getSubscriptions()); // existing function from subscriptionActions
  }, [dispatch]);

  // Display any Redux error
  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error}`);
    }
  }, [error]);

  const resetForm = () => {
    setDomainData({ name: '', description: '', industries: [], subscription_id: '' });
    setEditingDomain(null);
  };

  const closeModal = () => {
    resetForm();
    setShowModal(false);
  };

  const handleRowClick = (id) => {
    setSelectedDomains((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // CREATE
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
    } catch {
      // error in Redux
    }
  };

  // EDIT
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

  // UPDATE
  const handleUpdateDomain = async () => {
    if (!domainData.industries || domainData.industries.length === 0) {
      toast.error('At least one Industry is required.');
      return;
    }
    try {
      await dispatch(
        updateDomain({ id: editingDomain._id, domainData })
      );
      dispatch(fetchDomains());
      closeModal();
    } catch {
      // error in Redux
    }
  };

  // BULK DELETE
  const handleDeleteDomains = async () => {
    try {
      for (const id of selectedDomains) {
        await dispatch(deleteDomain(id));
      }
      dispatch(fetchDomains());
      setSelectedDomains([]);
      setShowConfirmDelete(false);
    } catch {
      // error in Redux
    }
  };

  return (
    <div className="container">
      <h2>Manage Domains</h2>

      {/* Action Buttons */}
      <div className="d-flex justify-content-between mb-3">
        <button
          className={`btn btn-danger ${selectedDomains.length === 0 ? 'disabled' : ''}`}
          onClick={() => setShowConfirmDelete(true)}
          disabled={selectedDomains.length === 0}
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
          <FontAwesomeIcon icon={faPlus} /> Add New Domain
        </button>
      </div>

      {/* Table */}
      <table className="table table-hover table-striped">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Description</th>
            <th>Industries</th>
            <th>Subscription</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6" className="text-center">
                Loading domains...
              </td>
            </tr>
          ) : domains.length > 0 ? (
            domains.map((domain) => {
              // Gather industries as comma-separated
              const industryNames = Array.isArray(domain.industries)
                ? domain.industries
                    .map((ind) => (typeof ind === 'object' ? ind.name : ind))
                    .join(', ')
                : '—';

              // Grab subscription name if populated
              let subscriptionLabel = '—';
              if (domain.subscription_id) {
                if (typeof domain.subscription_id === 'object') {
                  subscriptionLabel = domain.subscription_id.name || '—';
                } else {
                  subscriptionLabel = domain.subscription_id;
                }
              }

              return (
                <tr
                  key={domain._id}
                  className={selectedDomains.includes(domain._id) ? 'table-primary' : ''}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedDomains.includes(domain._id)}
                      onChange={() => handleRowClick(domain._id)}
                    />
                  </td>
                  <td>{domain.name}</td>
                  <td>{domain.description}</td>
                  <td>{industryNames}</td>
                  {/* Display subscription */}
                  <td>{subscriptionLabel}</td>
                  <td>
                    <FontAwesomeIcon
                      icon={faEdit}
                      onClick={() => handleEditClick(domain)}
                      style={{ cursor: 'pointer', fontSize: '0.9rem' }}
                      title="Edit"
                    />
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                No domains available.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Confirm Delete Modal */}
      {showConfirmDelete && (
        <ConfirmModal
          message={`Are you sure you want to delete ${selectedDomains.length} domain(s)?`}
          onConfirm={handleDeleteDomains}
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
                  // pass subscriptions to form
                  allSubscriptions={subscriptions}
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
