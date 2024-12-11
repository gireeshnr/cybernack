import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getUsers, addUser, updateUser, deleteUsers } from '../../auth/actions';
import CenterCard from '../CenterCard';
import toast from 'react-hot-toast';
import ConfirmModal from '../ConfirmModal';
import UserTable from './UserTable';
import UserForm from './UserForm';

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
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

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
      await getUsers();
    } catch (error) {
      toast.error('Error deleting users. Please try again.');
      console.error('Error deleting users:', error);
    }
  };

  const handleEditUser = (user) => {
    setUserData({
      firstName: user.name.first,
      lastName: user.name.last,
      email: user.email,
      role: user.role,
    });
    setEditingUserId(user._id);
    setIsEdit(true);
    setShowAddForm(true);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEdit) {
        await updateUser(editingUserId, userData);
        toast.success('User updated successfully!');
      } else {
        await addUser(userData);
        toast.success('New user added and activation link sent to email!');
      }
      setUserData({ firstName: '', lastName: '', email: '', role: 'user' });
      await getUsers();
      setShowAddForm(false);
      setIsEdit(false);
    } catch (error) {
      toast.error('Error adding/updating user. Please try again.');
      console.error('Error adding/updating user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CenterCard showLogo={false} className="large-card">
      <div className="card">
        <h4 className="card-header">Manage Users</h4>
        <div className="card-body">
          <div className="d-flex justify-content-between mb-3">
            <button
              className="btn btn-danger"
              onClick={() => setShowConfirmDelete(true)}
              disabled={selectedUsers.length === 0}
            >
              Delete Selected
            </button>
            <button className="btn btn-success" onClick={() => setShowAddForm(true)}>
              Add New User
            </button>
          </div>
          {loading ? (
                      <p>Loading users...</p>
                    ) : users && users.length > 0 ? (
                      <UserTable
                        users={users}
                        selectedUsers={selectedUsers}
                        onRowClick={handleRowClick}
                        onEditUser={handleEditUser}
                      />
                    ) : (
                      <p>No users found.</p>
                    )}
                  </div>
                </div>
          
                {showAddForm && (
                  <UserForm
                    userData={userData}
                    onChange={(e) => setUserData({ ...userData, [e.target.name]: e.target.value })}
                    onSubmit={handleAddUser}
                    onCancel={() => {
                      setShowAddForm(false);
                      setIsEdit(false);
                      setUserData({ firstName: '', lastName: '', email: '', role: 'user' });
                    }}
                    isEdit={isEdit}
                    isSubmitting={isSubmitting}
                  />
                )}
          
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
          
          ManageUsers.propTypes = {
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
          
          export default connect(mapStateToProps, { getUsers, addUser, updateUser, deleteUsers })(ManageUsers);