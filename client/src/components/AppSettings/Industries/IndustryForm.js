import React from 'react';
import PropTypes from 'prop-types';

const IndustryForm = ({
  isEditing,
  data,
  setData,
  onSubmit,
  isSubmitting,
  onCancel,
  allSubscriptions,
  isSuperadmin, // if true, show the subscription dropdown
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="card p-3 mb-4">
      <h4>{isEditing ? 'Edit Industry' : 'Add New Industry'}</h4>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        {/* Industry Name */}
        <div className="form-group mb-2">
          <label>Industry Name</label>
          <input
            type="text"
            name="name"
            className="form-control"
            value={data.name || ''}
            onChange={handleChange}
            required
          />
        </div>
        {/* Description */}
        <div className="form-group mb-2">
          <label>Description</label>
          <textarea
            name="description"
            className="form-control"
            value={data.description || ''}
            onChange={handleChange}
            rows="2"
          />
        </div>
        {/* Subscription Dropdown (for superadmin only) */}
        {isSuperadmin && (
          <div className="form-group mb-2">
            <label>Subscription</label>
            <select
              name="subscription_id"
              className="form-control"
              value={data.subscription_id || ''}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Subscription --</option>
              {allSubscriptions.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.name}
                </option>
              ))}
            </select>
            <small className="form-text text-muted">
              Select the subscription level for this industry.
            </small>
          </div>
        )}
        <div className="d-flex justify-content-end mt-3">
          <button
            type="button"
            className="btn btn-secondary me-2"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

IndustryForm.propTypes = {
  isEditing: PropTypes.bool.isRequired,
  data: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    subscription_id: PropTypes.string,
  }).isRequired,
  setData: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  allSubscriptions: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
    })
  ).isRequired,
  isSuperadmin: PropTypes.bool.isRequired,
};

export default IndustryForm;