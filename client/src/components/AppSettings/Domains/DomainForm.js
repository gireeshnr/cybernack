import React from 'react';
import PropTypes from 'prop-types';

const DomainForm = ({
  isEditing,
  data,
  setData,
  onSubmit,
  isSubmitting,
  onCancel,
  allSubscriptions,
  allIndustries,
  isSuperadmin,
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
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
        {/* For superadmin, subscription field goes at the top */}
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
              Select the subscription level for this domain.
            </small>
          </div>
        )}

        {/* Domain Name */}
        <div className="form-group mb-2">
          <label>Domain Name</label>
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

        {/* Industry Selection (only for superadmin) */}
        {isSuperadmin && (
          <div className="form-group mb-2">
            <label>Industry</label>
            <select
              name="industry_id"
              className="form-control"
              value={data.industry_id || ''}
              onChange={handleChange}
              required
              disabled={!data.subscription_id}
            >
              {!data.subscription_id ? (
                <option value="">Select subscription first</option>
              ) : (
                <>
                  <option value="">-- Select Industry --</option>
                  {allIndustries.map((industry) => (
                    <option key={industry._id} value={industry._id}>
                      {industry.name}
                    </option>
                  ))}
                </>
              )}
            </select>
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

DomainForm.propTypes = {
  isEditing: PropTypes.bool.isRequired,
  data: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    industry_id: PropTypes.string,
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
  allIndustries: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
      subscription_id: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    })
  ).isRequired,
  isSuperadmin: PropTypes.bool.isRequired,
};

export default DomainForm;