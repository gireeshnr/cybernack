import React, { useState, useEffect, lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getSubscriptions, createSubscription, updateSubscription, deleteSubscriptions } from '../../auth/actions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt, faPlus } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

// Lazy load ConfirmModal
const ConfirmModal = lazy(() => import('../ConfirmModal'));

const ManageSubscriptions = ({
  subscriptions,
  getSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscriptions,
}) => {
  const initialSubscriptionState = {
    name: '',
    description: '',
    priceMonthly: '',
    priceYearly: '',
    features: [],
    modules: [],
    isActive: true,
  };

  const [newSubscription, setNewSubscription] = useState(initialSubscriptionState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSubs, setSelectedSubs] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Fetch subscriptions on mount
  useEffect(() => {
    getSubscriptions();
  }, [getSubscriptions]);

  const handleRowClick = (subId) => {
    setSelectedSubs((prevSelected) =>
      prevSelected.includes(subId) ? prevSelected.filter((id) => id !== subId) : [...prevSelected, subId]
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewSubscription({ ...newSubscription, [name]: value });
  };

  const handleAddClick = () => {
    setNewSubscription(initialSubscriptionState);
    setShowAddForm(true);
    setShowEditForm(false);
  };

  const handleAddSubscription = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createSubscription(newSubscription);
      toast.success('Subscription added successfully!');
      setNewSubscription(initialSubscriptionState);
      await getSubscriptions();
      setShowAddForm(false);
    } catch {
      toast.error('Error adding subscription. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (sub) => {
    setNewSubscription({
      name: sub.name,
      description: sub.description,
      priceMonthly: sub.priceMonthly,
      priceYearly: sub.priceYearly,
      features: sub.features,
      modules: sub.modules,
      isActive: sub.isActive,
    });
    setEditingSub(sub);
    setShowEditForm(true);
    setShowAddForm(false);
  };

  const handleUpdateSubscription = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateSubscription(editingSub._id, newSubscription);
      toast.success('Subscription updated successfully!');
      await getSubscriptions();
      setShowEditForm(false);
    } catch {
      toast.error('Error updating subscription. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSubscriptions(selectedSubs);
      setSelectedSubs([]);
      toast.success(`${selectedSubs.length} subscription(s) deleted successfully!`);
      setShowConfirmDelete(false);
      await getSubscriptions();
    } catch {
      toast.error('Error deleting subscriptions. Please try again.');
    }
  };

  return (
    <div className="container">
      <h2>Manage Subscriptions</h2>

      {/* Action Buttons */}
      <div className="d-flex justify-content-between mb-3">
        <button
          className={`icon-delete btn btn-danger ${selectedSubs.length === 0 ? 'disabled' : ''}`}
          onClick={() => setShowConfirmDelete(true)}
          disabled={selectedSubs.length === 0}
        >
          <FontAwesomeIcon icon={faTrashAlt} /> Delete Selected
        </button>
        <button className="btn btn-success" onClick={handleAddClick}>
          <FontAwesomeIcon icon={faPlus} /> Add New Subscription
        </button>
      </div>

      {/* Subscriptions Table */}
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Select</th>
              <th>Subscription Name</th>
              <th>Monthly Price ($)</th>
              <th>Yearly Price ($)</th>
              <th>Features</th>
              <th>Modules</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => (
              <tr key={sub._id} className={selectedSubs.includes(sub._id) ? 'selected' : ''}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedSubs.includes(sub._id)}
                    onChange={() => handleRowClick(sub._id)}
                  />
                </td>
                <td>{sub.name}</td>
                <td>${sub.priceMonthly}</td>
                <td>${sub.priceYearly}</td>
                <td>{sub.features.join(', ')}</td>
                <td>{sub.modules.join(', ')}</td>
                <td>{sub.isActive ? 'Yes' : 'No'}</td>
                <td>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleEditClick(sub)}>
                    <FontAwesomeIcon icon={faEdit} /> Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || showEditForm) && (
        <div className="modal">
          <div className="modal-content">
            <h4>{showAddForm ? 'Add New Subscription' : 'Edit Subscription'}</h4>
            <form onSubmit={showAddForm ? handleAddSubscription : handleUpdateSubscription}>
              <div className="form-group">
                <label>Subscription Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={newSubscription.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  name="description"
                  className="form-control"
                  value={newSubscription.description}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Monthly Price ($)</label>
                <input
                  type="number"
                  name="priceMonthly"
                  className="form-control"
                  value={newSubscription.priceMonthly}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Yearly Price ($)</label>
                <input
                  type="number"
                  name="priceYearly"
                  className="form-control"
                  value={newSubscription.priceYearly}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Features</label>
                <input
                  type="text"
                  name="features"
                  className="form-control"
                  value={newSubscription.features.join(', ')}
                  onChange={(e) =>
                    setNewSubscription({ ...newSubscription, features: e.target.value.split(', ') })
                  }
                  placeholder="Enter comma-separated features"
                />
              </div>
              <div className="form-group">
                <label>Modules</label>
                <input
                  type="text"
                  name="modules"
                  className="form-control"
                  value={newSubscription.modules.join(', ')}
                  onChange={(e) =>
                    setNewSubscription({ ...newSubscription, modules: e.target.value.split(', ') })
                  }
                  placeholder="Enter comma-separated modules"
                />
              </div>
              <div className="form-group">
                <label>Active</label>
                <input
                  type="checkbox"
                  name="isActive"
                  className="form-check-input"
                  checked={newSubscription.isActive}
                  onChange={(e) =>
                    setNewSubscription({ ...newSubscription, isActive: e.target.checked })
                  }
                />
              </div>
              <div className="d-flex mt-3">
                <button
                  type="submit"
                  className="btn btn-primary me-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? showAddForm
                      ? 'Adding...'
                      : 'Updating...'
                    :                  showAddForm
                    ? 'Add Subscription'
                    : 'Update Subscription'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddForm(false);
                    setShowEditForm(false);
                    setNewSubscription(initialSubscriptionState);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmDelete && (
        <Suspense fallback={<div>Loading...</div>}>
          <ConfirmModal
            message={`Are you sure you want to delete ${selectedSubs.length} subscription(s)?`}
            onConfirm={handleDelete}
            onCancel={() => setShowConfirmDelete(false)}
          />
        </Suspense>
      )}
    </div>
  );
};

// PropTypes validation
ManageSubscriptions.propTypes = {
  subscriptions: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      priceMonthly: PropTypes.number.isRequired,
      priceYearly: PropTypes.number.isRequired,
      features: PropTypes.arrayOf(PropTypes.string),
      modules: PropTypes.arrayOf(PropTypes.string),
      isActive: PropTypes.bool.isRequired,
    })
  ).isRequired,
  getSubscriptions: PropTypes.func.isRequired,
  createSubscription: PropTypes.func.isRequired,
  updateSubscription: PropTypes.func.isRequired,
  deleteSubscriptions: PropTypes.func.isRequired,
};

// Map state to props
const mapStateToProps = (state) => ({
  subscriptions: state.subscription.subscriptions || [],
});

// Export connected component
export default connect(mapStateToProps, {
  getSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscriptions,
})(ManageSubscriptions);