import React from 'react';
import PropTypes from 'prop-types';

const OrganizationForm = ({
  isEditing,
  data,
  setData,
  onSubmit,
  onCancel,
  isSubmitting,
  subscriptions,
}) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className="modal">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <h4>{isEditing ? 'Edit Organization' : 'Add New Organization'}</h4>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <div className="form-group">
            <label>Organization Name:</label>
            <input
              type="text"
              name="orgName"
              className="form-control"
              value={data.orgName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Subscription Plan:</label>
            <select
              name="subscription"
              className="form-control"
              value={data.subscription}
              onChange={handleChange}
              required
            >
              <option value="">Select Subscription</option>
              {subscriptions.length === 0 ? (
                <option disabled>No subscriptions available</option>
              ) : (
                subscriptions.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name}
                  </option>
                ))
              )}
            </select>
          </div>
          <div className="form-group d-flex align-items-center">
            <label style={{ marginRight: '10px' }}>Active:</label>
            <input
              type="checkbox"
              name="isActive"
              className="form-check-input"
              checked={data.isActive}
              onChange={handleChange}
            />
          </div>
          <div className="d-flex mt-3">
            <button type="submit" className="btn btn-primary me-2" disabled={isSubmitting}>
              {isSubmitting ? (isEditing ? 'Updating...' : 'Adding...') : isEditing ? 'Update Organization' : 'Add Organization'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add PropTypes for validation
OrganizationForm.propTypes = {
  isEditing: PropTypes.bool.isRequired,
  data: PropTypes.object.isRequired,
  setData: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  subscriptions: PropTypes.array.isRequired,
};

export default OrganizationForm;