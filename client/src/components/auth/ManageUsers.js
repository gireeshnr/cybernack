import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { getUsers, addUser, updateUser, deleteUsers } from '../../auth/actions';
import CenterCard from '../CenterCard';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa'; // Corrected import
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ConfirmModal from '../ConfirmModal'; // Custom confirmation modal

const ManageUsers = ({ getUsers, addUser, updateUser, deleteUsers, users }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false); // Modal state for delete confirmation

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        await getUsers();
      } catch (error) {
        toast.error('Error fetching users.');
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [getUsers]);

  const handleRowClick = (userId) => {
    setSelectedUsers((prevSelected) =>
      prevSelected.includes(userId) ? prevSelected.filter((id) => id !== userId) : [...prevSelected, userId]
    );
  };

  const handleDelete = async () => {
    try {
      await deleteUsers(selectedUsers);
      setSelectedUsers([]);
      toast.success(`${selectedUsers.length} user(s) deleted successfully!`);
      await getUsers(); // Refresh table after delete
    } catch (error) {
      toast.error('Error deleting users. Please try again.');
      console.error('Error deleting users:', error);
    }
  };

  const handleConfirmDelete = () => {
    setShowConfirmDelete(true); // Show confirmation modal
  };

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEdit) {
        await updateUser(editingUserId, userData); // Pass userId during update
        toast.success('User updated successfully!');
      } else {
        await addUser(userData); // Add new user
        toast.success('New user added and activation link sent to email!');
      }
      setUserData({ firstName: '', lastName: '', email: '', role: 'user' }); // Clear form
      await getUsers(); // Refresh users table
      setShowAddForm(false); // Close modal after user is added/updated
      setIsEdit(false); // Reset edit state
    } catch (error) {
      if (error.message.includes('already exists')) {
        toast.error('User already exists. Please use a different email.');
      } else {
        toast.error('Error adding/updating user. Please try again.');
      }
      console.error('Error adding/updating user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = (user) => {
    setUserData({
      firstName: user.name.first,
      lastName: user.name.last,
      email: user.email,
      role: user.role,
    });
    setEditingUserId(user._id); // Set the userId for the user being edited
    setIsEdit(true);
    setShowAddForm(true); // Open form for editing
  };

  return (
    <CenterCard showLogo={false} className="large-card">
      <div className="card">
        <h4 className="card-header">Manage Users</h4>
        <div className="card-body">
          <div className="d-flex justify-content-between mb-3">
            <button
              className={`icon-delete btn btn-danger ${selectedUsers.length === 0 ? 'disabled' : ''}`}
              onClick={handleConfirmDelete} // Show confirmation modal instead of window.confirm
              disabled={selectedUsers.length === 0}
              title="Delete selected users"
            >
              <FaTrashAlt /> Delete Selected
            </button>
            <button className="btn btn-success" onClick={() => { setIsEdit(false); setShowAddForm(true); }}>
              <FaPlus /> Add New User
            </button>
          </div>

          {loading ? (
            <p>Loading users...</p>
          ) : users && users.length > 0 ? (
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
                        <button className="btn btn-secondary btn-sm" onClick={() => handleEditUser(user)}>
                          <FaEdit /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No users found.</p>
          )}
        </div>
      </div>

      {showAddForm && (
        <div className="modal">
          <div className="modal-content">
            <h4>{isEdit ? 'Edit User' : 'Add New User'}</h4>
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label>First Name:</label>
                <input
                  type="text"
                  name="firstName"
                  className="form-control"
                  value={userData.firstName}
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
                  required
                  disabled={isEdit} // Disable email during edit
                />
              </div>
              <div className="form-group">
                <label>Role:</label>
                <select
                  name="role"
                  className="form-control"
                  value={userData.role}
                  onChange={handleChange}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? (isEdit ? 'Updating...' : 'Adding...') : (isEdit ? 'Update User' : 'Add User')}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
      <ToastContainer /> {/* Toast container for notifications */}

      {/* Confirmation modal for deleting users */}
      {showConfirmDelete && (
        <ConfirmModal
          message={`Are you sure you want to delete ${selectedUsers.length} user(s)?`}
          onConfirm={handleDelete}
          onCancel={() => setShowConfirmDelete(false)}
        />
      )}
    </CenterCard>
  );
};

const mapStateToProps = (state) => ({
  users: state.auth.users || [],
});

export default connect(mapStateToProps, { getUsers, addUser, updateUser, deleteUsers })(ManageUsers);