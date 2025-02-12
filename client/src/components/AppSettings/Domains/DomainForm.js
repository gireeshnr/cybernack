import React from 'react';
import PropTypes from 'prop-types';

const DomainForm = ({
  isEditing,
  data,
  setData,
  onSubmit,
  isSubmitting,
  onCancel,
  allIndustries,
  allSubscriptions, // NEW
}) => {
  // Handles text fields (name, description)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  // Handles multi-select of industries
  const handleIndustriesChange = (e) => {
    const selectedValues = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );
    setData((prev) => ({
      ...prev,
      industries: selectedValues,
    }));
  };

  return (
    <div className="card p-3 mb-4">
      <h4>{isEditing ? 'Edit Domain' : 'Add New Domain'}</h4>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            className="form-control"
            value={data.name}
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
            rows="3"
          />
        </div>

        {/* Multi-select for Industries */}
        <div className="form-group">
          <label>Industries <span className="text-danger">*</span></label>
          <select
            multiple
            className="form-control"
            value={data.industries || []}
            onChange={handleIndustriesChange}
          >
            {allIndustries.map((ind) => (
              <option key={ind._id} value={ind._id}>
                {ind.name}
              </option>
            ))}
          </select>
          <small className="form-text text-muted">
            Hold Ctrl (Windows) or Cmd (Mac) to select multiple.  
            <br />
            At least one Industry is required.
          </small>
        </div>

        {/* NEW: Subscription Dropdown */}
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
            Optional: choose a subscription plan for this domain.
          </small>
        </div>

        <div className="d-flex justify-content-end">
          <button
            type="button"
            className="btn btn-secondary mr-2"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

DomainForm.propTypes = {
  isEditing: PropTypes.bool.isRequired,
  data: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    industries: PropTypes.arrayOf(PropTypes.string),
    subscription_id: PropTypes.string, // NEW
  }).isRequired,
  setData: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  allIndustries: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
    })
  ).isRequired,
  allSubscriptions: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
    })
  ).isRequired,
};

export default DomainForm;
