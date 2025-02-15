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
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="card p-3 mb-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className="form-group">
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

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            className="form-control"
            value={data.description || ''}
            onChange={handleChange}
            rows="2"
          />
        </div>

        {/* Subscription Dropdown */}
        <div className="form-group">
          <label>Subscription</label>
          <select
            name="subscription_id"
            className="form-control"
            value={data.subscription_id || ''}
            onChange={handleChange}
          >
            <option value="">-- Select Subscription --</option>
            {allSubscriptions.map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.name}
              </option>
            ))}
          </select>
          <small className="form-text text-muted">
            Choose which subscription this industry belongs to.
          </small>
        </div>

        <div className="d-flex justify-content-end">
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
};

export default IndustryForm;