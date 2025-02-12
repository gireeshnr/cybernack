// client/src/components/admin/ClientAdminUsers.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getUsers, addUser, updateUser, deleteUsers } from '../../auth/actions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt, faPlus } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import ConfirmModal from '../ConfirmModal';

const ClientAdminUsers = ({
  getUsers,
  addUser,
  updateUser,
  deleteUsers,
  users,
}) => {
  const initialUserData = {
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
    password: '',
    confirmPassword: '',
    isActive: true,
  };

  const [userData, setUserData] = useState(initialUserData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const refreshUsers = async () => {
    await getUsers();
  };

  const handleRowClick = (userId) => {
    setSelectedUsers((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId]
    );
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserData({
      ...userData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleAddUserClick = () => {
    setUserData(initialUserData);
    setShowAddForm(true);
    setShowEditForm(false);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (userData.password !== userData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    try {
      await addUser({ ...userData, isActive: true });
      toast.success('New user added successfully and activated!');
      setShowAddForm(false);
      await refreshUsers();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (user) => {
    setUserData({
      firstName: user.name.first,
      lastName: user.name.last,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });
    setEditingUser(user);
    setShowEditForm(true);
    setShowAddForm(false);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateUser(editingUser._id, { ...userData });
      toast.success('User updated successfully!');
      setShowEditForm(false);
      await refreshUsers();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUsers(selectedUsers);
      setSelectedUsers([]);
      toast.success(`${selectedUsers.length} user(s) deleted successfully!`);
      setShowConfirmDelete(false);
      await refreshUsers();
    } finally {
      // Ensure no additional code execution in case of errors
    }
  };

  return (
    <div className="container">
      <h2>Manage Users</h2>

      <div className="d-flex justify-content-between mb-3">
        <button
          className={`icon-delete btn btn-danger ${selectedUsers.length === 0 ? 'disabled' : ''}`}
          onClick={() => setShowConfirmDelete(true)}
          disabled={selectedUsers.length === 0}
        >
          <FontAwesomeIcon icon={faTrashAlt} /> Delete Selected
        </button>
        <button className="btn btn-success" onClick={handleAddUserClick}>
          <FontAwesomeIcon icon={faPlus} /> Add New User
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Select</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className={selectedUsers.includes(user._id) ? 'selected' : ''}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user._id)}
                    onChange={() => handleRowClick(user._id)}
                  />
                </td>
                <td>{user.name.first}</td>
                <td>{user.name.last}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.isActive ? 'Active' : 'Inactive'}</td>
                <td>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleEditClick(user)}>
                    <FontAwesomeIcon icon={faEdit} /> Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(showAddForm || showEditForm) && (
        <div className="modal">
          <div className="modal-content">
            <h4>{showAddForm ? 'Add New User' : 'Edit User'}</h4>
            <form onSubmit={showAddForm ? handleAddUser : handleUpdateUser}>
              <div className="form-group">
                <label>First Name:</label>
                <input
                  type="text"
                  name="firstName"
                  value={userData.firstName}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Last Name:</label>
                <input
                  type="text"
                  name="lastName"
                  value={userData.lastName}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleChange}
                  required
                  className="form-control"
                  readOnly={showEditForm}
                />
              </div>
              <div className="form-group">
                <label>Role:</label>
                <select
                  name="role"
                  value={userData.role}
                  onChange={handleChange}
                  required
                  className="form-control"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {showEditForm && (
                <div className="form-group">
                  <label>Active:</label>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={userData.isActive}
                    onChange={handleChange}
                  />
                </div>
              )}
              {showAddForm && (
                <>
                  <div className="form-group">
                    <label>Password:</label>
                    <input
                      type="password"
                      name="password"
                      value={userData.password}
                      onChange={handleChange}
                      required
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm Password:</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={userData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="form-control"
                    />
                  </div>
                </>
              )}
              <div className="d-flex justify-content-end mt-3">
                <button
                  type="submit"
                  className="btn btn-primary me-2" // Added margin-right here
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? showAddForm
                      ? 'Adding...'
                      : 'Updating...'
                      : showAddForm
                      ? 'Add User'
                      : 'Update User'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddForm(false);
                    setShowEditForm(false);
                    setUserData(initialUserData); // Reset the form
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation modal for deleting users */}
      {showConfirmDelete && (
        <ConfirmModal
          message={`Are you sure you want to delete ${selectedUsers.length} user(s)?`}
          onConfirm={handleDelete}
          onCancel={() => setShowConfirmDelete(false)}
        />
      )}
    </div>
  );
};

ClientAdminUsers.propTypes = {
  getUsers: PropTypes.func.isRequired,
  addUser: PropTypes.func.isRequired,
  updateUser: PropTypes.func.isRequired,
  deleteUsers: PropTypes.func.isRequired,
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
};

const mapStateToProps = (state) => ({
  users: state.auth.users || [],
});

export default connect(mapStateToProps, {
  getUsers,
  addUser,
  updateUser,
  deleteUsers,
})(ClientAdminUsers);