import React from 'react';
import PropTypes from 'prop-types';

const SubjectForm = ({
  isEditing,
  data,
  setData,
  onSubmit,
  isSubmitting,
  onCancel,
  allDomains,
  allSubscriptions,
}) => {
  // Handle text fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="card p-3 mb-4">
      <h4>{isEditing ? 'Edit Subject' : 'Add New Subject'}</h4>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        {/* Example: Subject Name */}
        <div className="form-group">
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

        {/* domain_id (single select) */}
        <div className="form-group">
          <label>Domain</label>
          <select
            name="domain_id"
            className="form-control"
            value={data.domain_id || ''}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Domain --</option>
            {allDomains.map((dom) => (
              <option key={dom._id} value={dom._id}>
                {dom.name}
              </option>
            ))}
          </select>
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
            (Optional) assign subscription for this subject.
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

SubjectForm.propTypes = {
  isEditing: PropTypes.bool.isRequired,
  data: PropTypes.shape({
    name: PropTypes.string,
    domain_id: PropTypes.string,
    subscription_id: PropTypes.string, // NEW
  }).isRequired,
  setData: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  allDomains: PropTypes.arrayOf(
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

export default SubjectForm;
