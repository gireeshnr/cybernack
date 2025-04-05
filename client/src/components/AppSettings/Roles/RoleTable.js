// client/src/components/AppSettings/Roles/RoleTable.js
import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faClone } from '@fortawesome/free-solid-svg-icons';

const RoleTable = ({
  roles = [],
  selectedRoles = [],
  onRowClick,
  onEditClick,
  onCloneClick,
  columnFilters = {
    name: '',
    description: '',
    subjects: '',
    addedBy: '',
    createdAt: '',
  },
  onColumnFilterChange,
  onToggleSelectAll,
  allSelected = false,
  isSuperadmin,
  activeTab,
}) => {
  return (
    <div className="table-responsive">
      <table className="table table-hover table-striped">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleSelectAll}
                style={{ marginRight: '4px' }}
              />
              <label style={{ fontSize: '0.8rem' }}>Select All</label>
            </th>
            <th>Role Name</th>
            <th>Description</th>
            <th>Subscription</th>
            <th>Subjects</th>
            <th>Added By</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
          {/* Filter Row */}
          <tr>
            <th></th>
            <th>
              <input
                type="text"
                placeholder="Filter Role Name"
                value={columnFilters.name}
                onChange={(e) => onColumnFilterChange('name', e.target.value)}
                className="form-control form-control-sm"
              />
            </th>
            <th>
              <input
                type="text"
                placeholder="Filter Description"
                value={columnFilters.description}
                onChange={(e) => onColumnFilterChange('description', e.target.value)}
                className="form-control form-control-sm"
              />
            </th>
            <th>
              <input
                type="text"
                placeholder="Filter Subscription"
                value={columnFilters.subscription || ''}
                onChange={(e) => onColumnFilterChange('subscription', e.target.value)}
                className="form-control form-control-sm"
              />
            </th>
            <th>
              <input
                type="text"
                placeholder="Filter Subjects"
                value={columnFilters.subjects}
                onChange={(e) => onColumnFilterChange('subjects', e.target.value)}
                className="form-control form-control-sm"
              />
            </th>
            <th>
              <input
                type="text"
                placeholder="Filter Added By"
                value={columnFilters.addedBy}
                onChange={(e) => onColumnFilterChange('addedBy', e.target.value)}
                className="form-control form-control-sm"
              />
            </th>
            <th>
              <input
                type="text"
                placeholder="Filter Date"
                value={columnFilters.createdAt}
                onChange={(e) => onColumnFilterChange('createdAt', e.target.value)}
                className="form-control form-control-sm"
              />
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {roles.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center">
                No roles available.
              </td>
            </tr>
          ) : (
            roles.map((role) => {
              const isSelected = selectedRoles.includes(role._id);
              return (
                <tr key={role._id} className={isSelected ? 'table-primary' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onRowClick(role._id)}
                      disabled={activeTab === 'global' && !isSuperadmin}
                    />
                  </td>
                  <td>{role.name}</td>
                  <td>{role.description || '—'}</td>
                  <td>{role.subscription || '—'}</td>
                  <td>
                    {Array.isArray(role.subjects) && role.subjects.length > 0
                      ? role.subjects
                          .map((s) => (typeof s === 'object' && s.name ? s.name : ''))
                          .join(', ')
                      : '—'}
                  </td>
                  <td>{role.addedBy || '—'}</td>
                  <td>{role.createdAt ? new Date(role.createdAt).toLocaleDateString() : ''}</td>
                  <td>
                    {((activeTab === 'global' && isSuperadmin) || (activeTab === 'local' && !isSuperadmin)) && (
                      <button
                        className="btn btn-sm"
                        onClick={() => onEditClick(role)}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                        }}
                        title="Edit"
                      >
                        <FontAwesomeIcon icon={faEdit} style={{ fontSize: '0.8rem' }} />
                      </button>
                    )}
                    {isSuperadmin && (
                      <button
                        className="btn btn-sm"
                        onClick={() => onCloneClick(role)}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                        }}
                        title="Clone"
                      >
                        <FontAwesomeIcon icon={faClone} style={{ fontSize: '0.8rem' }} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

RoleTable.propTypes = {
  roles: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      subjects: PropTypes.arrayOf(
        PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.shape({ _id: PropTypes.string, name: PropTypes.string }),
        ])
      ),
      subscription: PropTypes.string,
      addedBy: PropTypes.string,
      createdAt: PropTypes.string,
    })
  ),
  selectedRoles: PropTypes.arrayOf(PropTypes.string),
  onRowClick: PropTypes.func.isRequired,
  onEditClick: PropTypes.func,
  onCloneClick: PropTypes.func,
  columnFilters: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    subjects: PropTypes.string,
    addedBy: PropTypes.string,
    createdAt: PropTypes.string,
    subscription: PropTypes.string,
  }),
  onColumnFilterChange: PropTypes.func.isRequired,
  onToggleSelectAll: PropTypes.func.isRequired,
  allSelected: PropTypes.bool,
  isSuperadmin: PropTypes.bool,
  activeTab: PropTypes.string,
};

export default RoleTable;