import React from 'react';
import PropTypes from 'prop-types';

const UserForm = ({
  userData,
  onChange,
  onSubmit,
  onCancel,
  isEdit,
  isSubmitting,
}) => (
  <div className="modal">
    <div className="modal-content">
      <h4>{isEdit ? 'Edit User' : 'Add New User'}</h4>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>First Name:</label>
          <input
            type="text"
            name="firstName"
            className="form-control"
            value={userData.firstName}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Last Name:</label>
          <input
            type="text"
            name="lastName"
            className="form-control"
            value={userData.lastName}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={userData.email}
            onChange={onChange}
            required
            disabled={isEdit}
          />
        </div>
        <div className="form-group">
          <label>Role:</label>
          <select
            name="role"
            className="form-control"
            value={userData.role}
            onChange={onChange}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? (isEdit ? 'Updating...' : 'Adding...') : isEdit ? 'Update User' : 'Add User'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </form>
    </div>
  </div>
);

UserForm.propTypes = {
  userData: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isEdit: PropTypes.bool.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
};

export default UserForm;