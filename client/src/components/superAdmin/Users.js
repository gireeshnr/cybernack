// client/src/components/superAdmin/Users.js
import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getOrganizations, getUsers, addUser, updateUser, deleteUsers } from '../../auth/actions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt, faPlus, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

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
  const [allSelected, setAllSelected] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Column filters
  const [columnFilters, setColumnFilters] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    organization: '',
    active: '',
  });

  useEffect(() => {
    getOrganizations();
    getUsers();
  }, [getOrganizations, getUsers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [columnFilters]);

  const handleRowClick = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedUsers([]);
      setAllSelected(false);
    } else {
      const allIds = filteredUsers.map((u) => u._id);
      setSelectedUsers(allIds);
      setAllSelected(true);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserData({
      ...userData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Filters
  const handleColumnFilterChange = (column, value) => {
    setColumnFilters((prev) => ({ ...prev, [column]: value }));
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      let match = true;
      if (columnFilters.firstName) {
        if (!user.name.first.toLowerCase().includes(columnFilters.firstName.toLowerCase())) {
          match = false;
        }
      }
      if (columnFilters.lastName) {
        if (!user.name.last.toLowerCase().includes(columnFilters.lastName.toLowerCase())) {
          match = false;
        }
      }
      if (columnFilters.email) {
        if (!user.email.toLowerCase().includes(columnFilters.email.toLowerCase())) {
          match = false;
        }
      }
      if (columnFilters.role) {
        if (!user.role.toLowerCase().includes(columnFilters.role.toLowerCase())) {
          match = false;
        }
      }
      if (columnFilters.organization) {
        const orgName = user.org ? user.org.name.toLowerCase() : '';
        if (!orgName.includes(columnFilters.organization.toLowerCase())) {
          match = false;
        }
      }
      if (columnFilters.active) {
        const activeStr = user.isActive ? 'active' : 'inactive';
        if (!activeStr.includes(columnFilters.active.toLowerCase())) {
          match = false;
        }
      }
      return match;
    });
  }, [users, columnFilters]);

  const totalPages = Math.ceil(filteredUsers.length / recordsPerPage);
  const displayedUsers = filteredUsers.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Add
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
      getUsers();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit
  const handleEditClick = (user) => {
    setUserData({
      firstName: user.name.first,
      lastName: user.name.last,
      email: user.email,
      role: user.role,
      organizationId: user.org ? user.org._id : '',
      isActive: user.isActive,
      password: '',
      confirmPassword: '',
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
      getUsers();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!selectedUsers.length) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedUsers.length} user(s)?`)) {
      return;
    }
    try {
      await deleteUsers(selectedUsers);
      setSelectedUsers([]);
      toast.success(`${selectedUsers.length} user(s) deleted successfully!`);
      getUsers();
    } catch {}
  };

  return (
    <div className="container">
      <h2>Manage Users</h2>

      {/* Top row */}
      <div className="d-flex justify-content-between mb-2">
        <button
          className={`btn btn-danger ${selectedUsers.length === 0 ? 'disabled' : ''}`}
          onClick={handleDelete}
          disabled={selectedUsers.length === 0}
        >
          <FontAwesomeIcon icon={faTrashAlt} />
        </button>
        <button className="btn btn-success" onClick={handleAddUserClick}>
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>

      {/* Pagination top */}
      <div className="d-flex justify-content-end mb-2">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          style={{ background: 'transparent', border: 'none' }}
          title="Previous Page"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <span className="align-self-center mx-2">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          style={{ background: 'transparent', border: 'none' }}
          title="Next Page"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-hover table-striped">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  style={{ marginRight: '4px' }}
                />
                <label style={{ fontSize: '0.8rem', margin: 0 }}>Select All</label>
              </th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Organization</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
            {/* Filter row */}
            <tr>
              <th></th>
              <th>
                <input
                  type="text"
                  placeholder="Filter First Name"
                  value={columnFilters.firstName}
                  onChange={(e) => handleColumnFilterChange('firstName', e.target.value)}
                  className="form-control form-control-sm"
                />
              </th>
              <th>
                <input
                  type="text"
                  placeholder="Filter Last Name"
                  value={columnFilters.lastName}
                  onChange={(e) => handleColumnFilterChange('lastName', e.target.value)}
                  className="form-control form-control-sm"
                />
              </th>
              <th>
                <input
                  type="text"
                  placeholder="Filter Email"
                  value={columnFilters.email}
                  onChange={(e) => handleColumnFilterChange('email', e.target.value)}
                  className="form-control form-control-sm"
                />
              </th>
              <th>
                <input
                  type="text"
                  placeholder="Filter Role"
                  value={columnFilters.role}
                  onChange={(e) => handleColumnFilterChange('role', e.target.value)}
                  className="form-control form-control-sm"
                />
              </th>
              <th>
                <input
                  type="text"
                  placeholder="Filter Organization"
                  value={columnFilters.organization}
                  onChange={(e) => handleColumnFilterChange('organization', e.target.value)}
                  className="form-control form-control-sm"
                />
              </th>
              <th>
                <input
                  type="text"
                  placeholder="Filter Active"
                  value={columnFilters.active}
                  onChange={(e) => handleColumnFilterChange('active', e.target.value)}
                  className="form-control form-control-sm"
                />
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {displayedUsers.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center">
                  No users available.
                </td>
              </tr>
            ) : (
              displayedUsers.map((user) => (
                <tr key={user._id} className={selectedUsers.includes(user._id) ? 'table-primary' : ''}>
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
                  <td>{user.org ? user.org.name : 'N/A'}</td>
                  <td>{user.isActive ? 'Active' : 'Inactive'}</td>
                  <td>
                    <button
                      onClick={() => handleEditClick(user)}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                      title="Edit"
                    >
                      <FontAwesomeIcon icon={faEdit} style={{ fontSize: '0.8rem' }} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination bottom */}
      <div className="d-flex justify-content-end mt-2">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          style={{ background: 'transparent', border: 'none' }}
          title="Previous Page"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <span className="align-self-center mx-2">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          style={{ background: 'transparent', border: 'none' }}
          title="Next Page"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || showEditForm) && (
        <div className="modal">
          <div className="modal-content">
            <h4>{showAddForm ? 'Add New User' : 'Edit User'}</h4>
            <form onSubmit={showAddForm ? handleAddUser : handleUpdateUser}>
              <div className="form-group">
                <label>Organization:</label>
                <select
                  name="organizationId"
                  value={userData.organizationId}
                  onChange={handleChange}
                  required
                  className="form-control"
                >
                  <option value="">Select Organization</option>
                  {organizations.map((org) => (
                    <option key={org._id} value={org._id}>
                      {org.name}
                    </option>
                  ))}
                </select>
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
              <div className="d-flex justify-content-end mt-3">
                <button type="submit" className="btn btn-primary me-2" disabled={isSubmitting}>
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
                    setUserData(initialUserData);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

Users.propTypes = {
  getOrganizations: PropTypes.func.isRequired,
  getUsers: PropTypes.func.isRequired,
  addUser: PropTypes.func.isRequired,
  updateUser: PropTypes.func.isRequired,
  deleteUsers: PropTypes.func.isRequired,
  organizations: PropTypes.array.isRequired,
  users: PropTypes.array.isRequired,
};

const mapStateToProps = (state) => ({
  organizations: state.auth.organizations || [],
  users: state.auth.users || [],
});

export default connect(mapStateToProps, {
  getOrganizations,
  getUsers,
  addUser,
  updateUser,
  deleteUsers,
})(Users);