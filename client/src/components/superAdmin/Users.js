import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { getOrganizations, getUsers, addUser, updateUser, deleteUsers } from '../../auth/actions';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import ConfirmModal from '../ConfirmModal';
import 'react-toastify/dist/ReactToastify.css';

const Users = ({ getOrganizations, getUsers, addUser, updateUser, deleteUsers, organizations, users }) => {
  const initialUserData = {
    firstName: '',
    lastName: '',
    email: '',
    role: 'admin',
    organizationId: '',
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
    getOrganizations();
    getUsers();
  }, [getOrganizations, getUsers]);

  const refreshUsers = async () => {
    await getUsers();
  };

  const handleRowClick = (userId) => {
    setSelectedUsers((prevSelected) =>
      prevSelected.includes(userId) ? prevSelected.filter((id) => id !== userId) : [...prevSelected, userId]
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
    } catch (error) {
      toast.error('Error adding user. Please try again.');
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
      organizationId: user.org ? user.org._id : '',
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
    } catch (error) {
      toast.error('Error updating user. Please try again.');
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
    } catch (error) {
      toast.error('Error deleting users. Please try again.');
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
          <FaTrashAlt /> Delete Selected
        </button>
        <button className="btn btn-success" onClick={handleAddUserClick}>
          <FaPlus /> Add New User
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
              <th>Organization</th>
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
                <td>{user.org?.name || 'N/A'}</td>
                <td>{user.isActive ? 'Active' : 'Inactive'}</td>
                <td>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleEditClick(user)}>
                    <FaEdit /> Edit
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
                <label>Organization:</label>
                {showAddForm ? (
                  <select
                    name="organizationId"
                    value={userData.organizationId}
                    onChange={handleChange}
                    required
                    className="form-control"
                  >
                    <option value="">Select Organization</option>
                    {organizations.map((org) => (
                      <option key={org._id} value={org._id}>{org.name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    name="organizationName"
                    value={organizations.find((org) => org._id === userData.organizationId)?.name || 'N/A'}
                    readOnly
                    className="form-control"
                  />
                )}
              </div>
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
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
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
                      required={showAddForm}
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
                      required={showAddForm}                      className="form-control"
                      />
                    </div>
                  </>
                )}
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? (showAddForm ? 'Adding...' : 'Updating...') : showAddForm ? 'Add User' : 'Update User'}
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
              </form>
            </div>
          </div>
        )}
  
        <ToastContainer />
  
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
  
  const mapStateToProps = (state) => ({
    organizations: state.auth.organizations || [],
    users: state.auth.users || [],
  });
  
  export default connect(mapStateToProps, { getOrganizations, getUsers, addUser, updateUser, deleteUsers })(Users);