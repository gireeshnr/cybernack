// client/src/components/AppSettings/TrainingPaths/TrainingPathForm.js
import React from 'react';
import PropTypes from 'prop-types';

const TrainingPathForm = ({
  isEditing,
  data,
  setData,
  onSubmit,
  isSubmitting,
  onCancel,
  allRoles,
  allSubjects,
  allSubscriptions,
  isSuperadmin = false,
}) => {
  // We define hierarchical levels for subscription
  const subscriptionLevels = {
    Free: 1,
    Standard: 2,
    Enterprise: 3,
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (e, fieldName) => {
    const selectedValues = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );
    setData((prev) => ({
      ...prev,
      [fieldName]: selectedValues,
    }));
  };

  // Filter subjects by subscription (if superadmin is selecting a subscription)
  let filteredSubjects = allSubjects;
  if (isSuperadmin && data.subscription) {
    // Find which subscription name is selected
    const subObj = allSubscriptions.find((s) => s._id === data.subscription);
    const selectedName = subObj ? subObj.name : data.subscription;
    filteredSubjects = allSubjects.filter((subject) => {
      let subName = subject.subscription;
      // If the subject only has subscription_id...
      if (!subName && subject.subscription_id) {
        if (typeof subject.subscription_id === 'object' && subject.subscription_id.name) {
          subName = subject.subscription_id.name;
        }
      }
      if (!subName) return false;
      return subscriptionLevels[subName] <= subscriptionLevels[selectedName];
    });
  }

  // Filter roles by subscription
  let filteredRoles = allRoles;
  if (isSuperadmin && data.subscription) {
    const subObj = allSubscriptions.find((s) => s._id === data.subscription);
    const selectedName = subObj ? subObj.name : data.subscription;
    filteredRoles = allRoles.filter((role) => {
      if (!role.subscription) return false;
      return subscriptionLevels[role.subscription] <= subscriptionLevels[selectedName];
    });
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="card p-3 mb-4">
      <h4>{isEditing ? 'Edit Training Path' : 'Add New Training Path'}</h4>
      <form onSubmit={handleSubmit}>
        {/* Subscription (only for superadmin) */}
        {isSuperadmin && (
          <div className="form-group mb-2">
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
              {allSubscriptions.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Name */}
        <div className="form-group mb-2">
          <label>Training Path Name</label>
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
            rows="3"
          />
        </div>

        {/* Roles multi-select */}
        <div className="form-group mb-2">
          <label>Roles</label>
          {isSuperadmin && !data.subscription ? (
            <p className="text-warning">Select a subscription to filter roles.</p>
          ) : (
            <select
              multiple
              className="form-control"
              value={data.role_ids || []}
              onChange={(e) => handleMultiSelectChange(e, 'role_ids')}
            >
              {filteredRoles.map((role) => (
                <option key={role._id} value={role._id}>
                  {role.name} ({role.subscription})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Subjects multi-select */}
        <div className="form-group mb-2">
          <label>Subjects</label>
          {isSuperadmin && !data.subscription ? (
            <p className="text-warning">Select a subscription to filter subjects.</p>
          ) : (
            <select
              multiple
              className="form-control"
              value={data.subjectMappings || []}
              onChange={(e) => handleMultiSelectChange(e, 'subjectMappings')}
            >
              {filteredSubjects.map((subject) => {
                let subName = subject.subscription;
                if (!subName && subject.subscription_id?.name) {
                  subName = subject.subscription_id.name;
                }
                return (
                  <option key={subject._id} value={subject._id}>
                    {subject.name} {subName && `(${subName})`}
                  </option>
                );
              })}
            </select>
          )}
          <small className="form-text text-muted">
            Hold Ctrl/Cmd to select multiple. At least one subject is recommended.
          </small>
        </div>

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
            {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

TrainingPathForm.propTypes = {
  isEditing: PropTypes.bool.isRequired,
  data: PropTypes.shape({
    subscription: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    role_ids: PropTypes.arrayOf(PropTypes.string),
    subjectMappings: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  setData: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  allRoles: PropTypes.array.isRequired,
  allSubjects: PropTypes.array.isRequired,
  allSubscriptions: PropTypes.array.isRequired,
  isSuperadmin: PropTypes.bool,
};

export default TrainingPathForm;