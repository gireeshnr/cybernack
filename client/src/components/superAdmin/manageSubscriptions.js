// client/src/components/superAdmin/manageSubscriptions.js
import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  getSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscriptions,
} from '../../auth/actions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faTrashAlt,
  faPlus,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

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
  const [allSelected, setAllSelected] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingSub, setEditingSub] = useState(null);

  // Column filters
  const [columnFilters, setColumnFilters] = useState({
    name: '',
    description: '',
    priceMonthly: '',
    priceYearly: '',
    features: '',
    modules: '',
    active: '',
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    getSubscriptions();
  }, [getSubscriptions]);

  useEffect(() => {
    setCurrentPage(1);
  }, [columnFilters]);

  const handleRowClick = (subId) => {
    setSelectedSubs((prevSelected) =>
      prevSelected.includes(subId)
        ? prevSelected.filter((id) => id !== subId)
        : [...prevSelected, subId]
    );
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedSubs([]);
      setAllSelected(false);
    } else {
      const allIds = filteredSubscriptions.map((sub) => sub._id);
      setSelectedSubs(allIds);
      setAllSelected(true);
    }
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
    if (!selectedSubs.length) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedSubs.length} subscription(s)?`)) {
      return;
    }
    try {
      await deleteSubscriptions(selectedSubs);
      setSelectedSubs([]);
      toast.success(`${selectedSubs.length} subscription(s) deleted successfully!`);
      await getSubscriptions();
    } catch {
      toast.error('Error deleting subscriptions. Please try again.');
    }
  };

  const handleColumnFilterChange = (column, value) => {
    setColumnFilters((prev) => ({ ...prev, [column]: value }));
  };

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      let match = true;
      if (columnFilters.name && !sub.name.toLowerCase().includes(columnFilters.name.toLowerCase())) {
        match = false;
      }
      if (columnFilters.description && (!sub.description || !sub.description.toLowerCase().includes(columnFilters.description.toLowerCase()))) {
        match = false;
      }
      if (columnFilters.priceMonthly && sub.priceMonthly.toString().indexOf(columnFilters.priceMonthly) === -1) {
        match = false;
      }
      if (columnFilters.priceYearly && sub.priceYearly.toString().indexOf(columnFilters.priceYearly) === -1) {
        match = false;
      }
      if (columnFilters.features) {
        const featuresStr = sub.features.join(', ');
        if (!featuresStr.toLowerCase().includes(columnFilters.features.toLowerCase())) {
          match = false;
        }
      }
      if (columnFilters.modules) {
        const modulesStr = sub.modules.join(', ');
        if (!modulesStr.toLowerCase().includes(columnFilters.modules.toLowerCase())) {
          match = false;
        }
      }
      if (columnFilters.active) {
        const activeStr = sub.isActive ? 'yes' : 'no';
        if (!activeStr.toLowerCase().includes(columnFilters.active.toLowerCase())) {
          match = false;
        }
      }
      return match;
    });
  }, [subscriptions, columnFilters]);

  const totalPages = Math.ceil(filteredSubscriptions.length / recordsPerPage);
  const displayedSubscriptions = filteredSubscriptions.slice(
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
    <div className="container">
      <h2>Manage Subscriptions</h2>

      {/* Top Action Row */}
      <div className="d-flex justify-content-between mb-2">
        <button
          className={`btn btn-danger ${selectedSubs.length === 0 ? 'disabled' : ''}`}
          onClick={handleDelete}
          disabled={selectedSubs.length === 0}
        >
          <FontAwesomeIcon icon={faTrashAlt} />
        </button>
        <button className="btn btn-success" onClick={handleAddClick}>
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>

      {/* Top Pagination */}
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

      {/* Subscriptions Table */}
      <div className="table-responsive">
        <table className="table table-hover table-striped">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  style={{ marginRight: '4px' }}
                />
                <label style={{ fontSize: '0.8rem', margin: 0 }}>Select All</label>
              </th>
              <th>Subscription Name</th>
              <th>Monthly Price ($)</th>
              <th>Yearly Price ($)</th>
              <th>Features</th>
              <th>Modules</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
            <tr>
              <th></th>
              <th>
                <input
                  type="text"
                  placeholder="Filter Name"
                  value={columnFilters.name}
                  onChange={(e) => handleColumnFilterChange('name', e.target.value)}
                  className="form-control form-control-sm"
                />
              </th>
              <th>
                <input
                  type="text"
                  placeholder="Filter Monthly Price"
                  value={columnFilters.priceMonthly}
                  onChange={(e) => handleColumnFilterChange('priceMonthly', e.target.value)}
                  className="form-control form-control-sm"
                />
              </th>
              <th>
                <input
                  type="text"
                  placeholder="Filter Yearly Price"
                  value={columnFilters.priceYearly}
                  onChange={(e) => handleColumnFilterChange('priceYearly', e.target.value)}
                  className="form-control form-control-sm"
                />
              </th>
              <th>
                <input
                  type="text"
                  placeholder="Filter Features"
                  value={columnFilters.features}
                  onChange={(e) => handleColumnFilterChange('features', e.target.value)}
                  className="form-control form-control-sm"
                />
              </th>
              <th>
                <input
                  type="text"
                  placeholder="Filter Modules"
                  value={columnFilters.modules}
                  onChange={(e) => handleColumnFilterChange('modules', e.target.value)}
                  className="form-control form-control-sm"
                />
              </th>
              <th>
                <input
                  type="text"
                  placeholder="Filter Active"
                  value={columnFilters.active}
                  onChange={(e) => handleColumnFilterChange('active', e.target.value)}
                  className="form-control form-control-sm"
                />
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {displayedSubscriptions.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center">
                  No subscriptions available.
                </td>
              </tr>
            ) : (
              displayedSubscriptions.map((sub) => (
                <tr key={sub._id} className={selectedSubs.includes(sub._id) ? 'table-primary' : ''}>
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
                    <button
                      onClick={() => handleEditClick(sub)}
                      style={{ background: 'none', border: 'none', padding: 0 }}
                      title="Edit"
                    >
                      <FontAwesomeIcon icon={faEdit} style={{ fontSize: '0.8rem' }} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Pagination */}
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
                <label>Features (comma separated)</label>
                <input
                  type="text"
                  name="features"
                  className="form-control"
                  value={newSubscription.features.join(', ')}
                  onChange={(e) =>
                    setNewSubscription({
                      ...newSubscription,
                      features: e.target.value.split(', ').map((s) => s.trim()),
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Modules (comma separated)</label>
                <input
                  type="text"
                  name="modules"
                  className="form-control"
                  value={newSubscription.modules.join(', ')}
                  onChange={(e) =>
                    setNewSubscription({
                      ...newSubscription,
                      modules: e.target.value.split(', ').map((s) => s.trim()),
                    })
                  }
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
                    : showAddForm
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
    </div>
  );
};

ManageSubscriptions.propTypes = {
  subscriptions: PropTypes.array.isRequired,
  getSubscriptions: PropTypes.func.isRequired,
  createSubscription: PropTypes.func.isRequired,
  updateSubscription: PropTypes.func.isRequired,
  deleteSubscriptions: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  subscriptions: state.subscription.subscriptions || [],
});

export default connect(mapStateToProps, {
  getSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscriptions,
})(ManageSubscriptions);