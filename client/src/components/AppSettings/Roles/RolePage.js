// client/src/components/AppSettings/Roles/RolePage.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRoles, createRole, updateRole, deleteRole } from '../../../reducers/roleSlice';
import { fetchSubjects } from '../../../reducers/subjectSlice';
import RoleForm from './RoleForm';
import RoleTable from './RoleTable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faPlus, faChevronLeft, faChevronRight, faClone } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

const RolePage = () => {
  const dispatch = useDispatch();
  const { roles, loading, error } = useSelector((state) => state.roles);
  const { subjects } = useSelector((state) => state.subjects);
  const { profile } = useSelector((state) => state.auth);

  const isSuperadmin = profile?.role?.toLowerCase() === 'superadmin';
  const organizationId = profile?.organization?._id;
  // For local admin, inherit subscription from the organization.
  const clientSubscription = isSuperadmin ? '' : profile?.organization?.subscription?.name || '';

  const [selectedIds, setSelectedIds] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleData, setRoleData] = useState({
    name: '',
    description: '',
    subjects: [],
    subscription: isSuperadmin ? '' : clientSubscription,
  });

  const [activeTab, setActiveTab] = useState('global');
  const [columnFilters, setColumnFilters] = useState({ name: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Always fetch roles and subjects using the organization's subscription ID (if available).
  useEffect(() => {
    dispatch(fetchRoles());
    if (profile?.organization?.subscription) {
      const subId =
        profile.organization.subscription._id || profile.organization.subscription;
      dispatch(fetchSubjects(subId));
    }
  }, [dispatch, profile]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Filter roles based on active tab.
  const filteredRoles = roles.filter((role) => {
    if (activeTab === 'global') {
      return role.organization_id === null; // Global roles.
    } else {
      // For local roles:
      // - For superadmin, show every role with organization_id (regardless of which organization)
      // - For client admin, show only those matching their organization.
      if (isSuperadmin) {
        return role.organization_id !== null;
      } else {
        return role.organization_id && role.organization_id.toString() === organizationId.toString();
      }
    }
  });

  const totalPages = Math.ceil(filteredRoles.length / recordsPerPage);
  const displayedRoles = filteredRoles.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleRowClick = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
      setAllSelected(false);
    } else {
      const allShownIds = displayedRoles.map((r) => r._id);
      setSelectedIds(allShownIds);
      setAllSelected(true);
    }
  };

  const resetForm = () => {
    setRoleData({
      name: '',
      description: '',
      subjects: [],
      subscription: isSuperadmin ? '' : clientSubscription,
    });
    setEditingRole(null);
  };

  const closeModal = () => {
    resetForm();
    setShowModal(false);
  };

  const handleAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditClick = (role) => {
    setEditingRole(role);
    setRoleData({
      name: role.name,
      description: role.description,
      subjects: role.subjects.map((subject) => subject._id || subject),
      subscription: role.subscription || (isSuperadmin ? '' : clientSubscription),
    });
    setShowModal(true);
  };

  const handleCreateRole = async () => {
    if (!roleData.name || !roleData.subscription) {
      toast.error('Role name and subscription are required.');
      return;
    }
    try {
      const dataToSend = {
        ...roleData,
        subjects: roleData.subjects.map((subject) => subject._id || subject),
        organization_id: isSuperadmin ? null : organizationId,
        addedBy: isSuperadmin ? 'Cybernack' : profile?.organization?.name,
      };

      const response = await dispatch(createRole(dataToSend));

      if (response.error) {
        if (response.payload?.message === 'A role with the same name already exists.') {
          toast.error('A role with the same name already exists.');
        } else {
          toast.error('Error creating role.');
        }
      } else {
        toast.success('Role created!');
        closeModal();
        dispatch(fetchRoles());
      }
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error('Error creating role.');
    }
  };

  const handleUpdateRole = async () => {
    if (!roleData.name || !roleData.subscription) {
      toast.error('Role name and subscription are required.');
      return;
    }
    try {
      await dispatch(updateRole({ id: editingRole._id, data: roleData }));
      toast.success('Role updated!');
      closeModal();
      dispatch(fetchRoles());
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Error updating role.');
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Delete ${selectedIds.length} role(s)?`)) return;
    try {
      for (const id of selectedIds) {
        await dispatch(deleteRole(id));
      }
      toast.success(`Deleted ${selectedIds.length} record(s)!`);
      setSelectedIds([]);
      setAllSelected(false);
      dispatch(fetchRoles());
    } catch (error) {
      console.error('Error deleting roles:', error);
      toast.error('Error deleting roles.');
    }
  };

  const handleCloneClick = (roleObj) => {
    const clonedRole = {
      name: `${roleObj.name}_clone`,
      description: roleObj.description,
      subjects: roleObj.subjects.map((subject) => subject._id),
      subscription: roleObj.subscription,
      organization_id: activeTab === 'local' ? organizationId : null,
      addedBy: 'Cybernack',
    };
    setRoleData(clonedRole);
    setShowModal(true);
  };

  const handleColumnFilterChange = (column, value) => {
    setColumnFilters((prev) => ({ ...prev, [column]: value }));
    setCurrentPage(1);
  };

  if (loading) return <div>Loading Roles...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-3">
      <h2>Manage Roles</h2>

      {/* Tabs for Global and Local Roles */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'global' ? 'active' : ''}`}
            onClick={() => setActiveTab('global')}
          >
            Global Roles
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'local' ? 'active' : ''}`}
            onClick={() => setActiveTab('local')}
          >
            Local Roles
          </button>
        </li>
      </ul>

      <div className="d-flex justify-content-between mb-2">
        {(activeTab === 'local' || isSuperadmin) && (
          <button
            className={`btn btn-danger ${selectedIds.length === 0 ? 'disabled' : ''}`}
            onClick={handleDeleteSelected}
            disabled={selectedIds.length === 0}
          >
            <FontAwesomeIcon icon={faTrashAlt} />
          </button>
        )}
        {((activeTab === 'global' && isSuperadmin) || (activeTab === 'local' && !isSuperadmin)) && (
          <button className="btn btn-success" onClick={handleAdd}>
            <FontAwesomeIcon icon={faPlus} />
          </button>
        )}
      </div>

      <RoleTable
        roles={displayedRoles}
        selectedRoles={selectedIds}
        onRowClick={handleRowClick}
        onEditClick={handleEditClick}
        onCloneClick={isSuperadmin ? handleCloneClick : null}
        columnFilters={columnFilters}
        onColumnFilterChange={handleColumnFilterChange}
        onToggleSelectAll={toggleSelectAll}
        allSelected={allSelected}
        isSuperadmin={isSuperadmin}
        activeTab={activeTab}
      />

      {/* Pagination */}
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

      {/* Modal for Add/Edit Role */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingRole ? 'Edit Role' : 'Add Role'}
                </h5>
                <button
                  type="button"
                  className="close"
                  onClick={closeModal}
                  style={{ background: 'none', border: 'none' }}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <RoleForm
                  data={roleData}
                  setData={setRoleData}
                  onSubmit={editingRole ? handleUpdateRole : handleCreateRole}
                  onCancel={closeModal}
                  isEditing={!!editingRole}
                  isSubmitting={false}
                  allSubjects={subjects}
                  isSuperadmin={isSuperadmin}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolePage;