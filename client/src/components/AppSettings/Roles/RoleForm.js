import React from 'react';
import PropTypes from 'prop-types';

const RoleForm = ({
  isEditing,
  data,
  setData,
  onSubmit,
  isSubmitting,
  onCancel,
  allSubjects,
  isSuperadmin = false,
}) => {
  // Define hierarchical levels for subscriptions.
  const subscriptionLevels = {
    'Free': 1,
    'Standard': 2,
    'Enterprise': 3,
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubjectsChange = (e) => {
    const selectedValues = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );
    setData((prev) => ({
      ...prev,
      subjects: selectedValues,
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  // Filter subjects based on the selected subscription for superadmin.
  let filteredSubjects = allSubjects;
  if (isSuperadmin && data.subscription) {
    filteredSubjects = allSubjects.filter((sub) => {
      // Get the subject's subscription name from either property.
      let subjectSub = sub.subscription;
      if (!subjectSub && sub.subscription_id && sub.subscription_id.name) {
        subjectSub = sub.subscription_id.name;
      }
      if (!subjectSub) return false;
      return subscriptionLevels[subjectSub] <= subscriptionLevels[data.subscription];
    });
  }

  return (
    <div className="card p-3 mb-4">
      <h4>{isEditing ? 'Edit Role' : 'Add New Role'}</h4>
      <form onSubmit={handleFormSubmit}>
        {/* Only show subscription selector for superadmin */}
        {isSuperadmin && (
          <div className="form-group">
            <label>
              Subscription <span className="text-danger">*</span>
            </label>
            <select
              name="subscription"
              className="form-control"
              value={data.subscription || ''}
              onChange={handleChange}
              required
            >
              <option value="">Select Subscription</option>
              <option value="Free">Free</option>
              <option value="Standard">Standard</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
        )}

        {/* Role Name */}
        <div className="form-group">
          <label>Role Name</label>
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

        {/* Multi-select for Subjects */}
        <div className="form-group">
          <label>
            Subjects <span className="text-danger">*</span>
          </label>
          {isSuperadmin && !data.subscription ? (
            <p className="text-warning">Please select a subscription to filter subjects.</p>
          ) : (
            <select
              multiple
              className="form-control"
              value={data.subjects || []}
              onChange={handleSubjectsChange}
            >
              {Array.isArray(filteredSubjects) && filteredSubjects.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.name} (
                  {(sub.subscription)
                    ? sub.subscription
                    : (sub.subscription_id && sub.subscription_id.name) || 'N/A'}
                  )
                </option>
              ))}
            </select>
          )}
          <small className="form-text text-muted">
            Hold Ctrl (Windows) or Cmd (Mac) to select multiple.
            <br />
            At least one Subject is recommended.
          </small>
        </div>

        {/* Action Buttons */}
        <div className="d-flex justify-content-end mt-3">
          <button
            type="button"
            className="btn btn-secondary me-2"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || (isSuperadmin && !data.subscription)}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

RoleForm.propTypes = {
  isEditing: PropTypes.bool.isRequired,
  data: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    subjects: PropTypes.arrayOf(PropTypes.string),
    subscription: PropTypes.string,
  }).isRequired,
  setData: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  allSubjects: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string,
      subscription: PropTypes.string,
      subscription_id: PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string,
      }),
    })
  ).isRequired,
  isSuperadmin: PropTypes.bool,
};

export default RoleForm;