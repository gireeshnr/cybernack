// client/src/components/AppSettings/Subjects/SubjectForm.js
import React from 'react';
import PropTypes from 'prop-types';

const SubjectForm = ({
  isEditing,
  data,
  setData,
  onSubmit,
  isSubmitting,
  onCancel,
  allSubscriptions,
  allDomains,
  isSuperadmin,
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="card p-3 mb-4">
      <h4>{isEditing ? 'Edit Subject' : 'Add New Subject'}</h4>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        {/* For superadmin, ask first for subscription */}
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
              {allSubscriptions.map(sub => (
                <option key={sub._id} value={sub._id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {/* Subject Name */}
        <div className="form-group mb-2">
          <label>Subject Name</label>
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
        {/* Domain Dropdown */}
        <div className="form-group mb-2">
          <label>Domain</label>
          <select
            name="domain_id"
            className="form-control"
            value={data.domain_id || ''}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Domain --</option>
            {allDomains.map(domain => (
              <option key={domain._id} value={domain._id}>
                {domain.name}
              </option>
            ))}
          </select>
        </div>
        <div className="d-flex justify-content-end mt-3">
          <button type="button" className="btn btn-secondary me-2" onClick={onCancel} disabled={isSubmitting}>
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

SubjectForm.propTypes = {
  isEditing: PropTypes.bool.isRequired,
  data: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    domain_id: PropTypes.string,
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
  allDomains: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
    })
  ).isRequired,
  isSuperadmin: PropTypes.bool.isRequired,
};

export default SubjectForm;