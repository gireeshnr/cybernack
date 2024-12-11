import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

// Functional component for rendering the user table
const UserTable = ({ users, selectedUsers, onRowClick, onEditUser }) => {
  return (
    <div className="table-responsive">
      <table className="table table-hover">
        <thead>
          <tr>
            <th>Select</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            // Ensure all mandatory fields are filled
            if (
              !user.name?.first ||
              !user.name?.last ||
              !user.email ||
              !user.role
            ) {
              console.warn(
                `User ${user._id} has incomplete mandatory fields and will not be rendered.`
              );
              return null; // Skip rendering rows with missing mandatory fields
            }

            return (
              <tr
                key={user._id}
                className={selectedUsers.includes(user._id) ? 'selected' : ''}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user._id)}
                    onChange={() => onRowClick(user._id)}
                  />
                </td>
                <td>{user.name.first}</td>
                <td>{user.name.last}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.isActive ? 'Active' : 'Inactive'}</td>
                <td>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onEditUser(user)}
                  >
                    <FontAwesomeIcon icon={faEdit} /> Edit
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// PropTypes validation for better development experience
UserTable.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.shape({
        first: PropTypes.string.isRequired,
        last: PropTypes.string.isRequired,
      }).isRequired,
      email: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
      isActive: PropTypes.bool.isRequired,
    })
  ).isRequired,
  selectedUsers: PropTypes.arrayOf(PropTypes.string).isRequired,
  onRowClick: PropTypes.func.isRequired,
  onEditUser: PropTypes.func.isRequired,
};

export default UserTable;