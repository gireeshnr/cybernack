import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faClone } from '@fortawesome/free-solid-svg-icons';

const TrainingPathTable = ({
  trainingPaths,
  selectedTrainingPaths,
  onRowClick,
  onEditClick,
  onCloneClick,
  columnFilters,
  onColumnFilterChange,
  onToggleSelectAll,
  allSelected,
  showSubscriptionColumn = false,
  isSuperadmin = false,
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
            <th>Name</th>
            <th>Description</th>
            <th>Roles</th>
            <th>Subjects</th>
            {showSubscriptionColumn && <th>Subscription</th>}
            <th>Added By</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
          <tr>
            <th></th>
            <th>
              <input
                type="text"
                placeholder="Filter Name"
                className="form-control form-control-sm"
                value={columnFilters.name}
                onChange={(e) => onColumnFilterChange('name', e.target.value)}
              />
            </th>
            <th>
              <input
                type="text"
                placeholder="Filter Description"
                className="form-control form-control-sm"
                value={columnFilters.description}
                onChange={(e) => onColumnFilterChange('description', e.target.value)}
              />
            </th>
            <th>
              <input
                type="text"
                placeholder="Filter Roles"
                className="form-control form-control-sm"
                value={columnFilters.role}
                onChange={(e) => onColumnFilterChange('role', e.target.value)}
              />
            </th>
            <th>
              <input
                type="text"
                placeholder="Filter Subjects"
                className="form-control form-control-sm"
                value={columnFilters.subjects}
                onChange={(e) => onColumnFilterChange('subjects', e.target.value)}
              />
            </th>
            {showSubscriptionColumn && (
              <th>
                <input
                  type="text"
                  placeholder="Filter Subscription"
                  className="form-control form-control-sm"
                  value={columnFilters.subscription || ''}
                  onChange={(e) => onColumnFilterChange('subscription', e.target.value)}
                />
              </th>
            )}
            <th>
              <input
                type="text"
                placeholder="Filter Added By"
                className="form-control form-control-sm"
                value={columnFilters.addedBy}
                onChange={(e) => onColumnFilterChange('addedBy', e.target.value)}
              />
            </th>
            <th>
              <input
                type="text"
                placeholder="Filter Date"
                className="form-control form-control-sm"
                value={columnFilters.createdAt}
                onChange={(e) => onColumnFilterChange('createdAt', e.target.value)}
              />
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {trainingPaths.length === 0 ? (
            <tr>
              <td colSpan={showSubscriptionColumn ? 9 : 8} className="text-center">
                No training paths found.
              </td>
            </tr>
          ) : (
            trainingPaths.map((tp) => {
              const isSelected = selectedTrainingPaths.includes(tp._id);
              const rolesStr =
                Array.isArray(tp.role_ids) && tp.role_ids.length > 0
                  ? tp.role_ids
                      .map((r) => (typeof r === 'object' && r.name ? r.name : r))
                      .join(', ')
                  : '—';
              const subjectsStr =
                (tp.subjectMappings || [])
                  .map((sm) => (sm.subject_id && sm.subject_id.name) || '')
                  .filter(Boolean)
                  .join(', ') || '—';
              const createdAtStr = tp.createdAt ? new Date(tp.createdAt).toLocaleDateString() : '';
              const subscriptionStr = showSubscriptionColumn ? (tp.subscription || '—') : '';
              return (
                <tr key={tp._id} className={isSelected ? 'table-primary' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onRowClick(tp._id)}
                      // For local admins, disable checkbox selection for global records
                      disabled={!isSuperadmin && tp.organization_id === null}
                    />
                  </td>
                  <td>{tp.name}</td>
                  <td>{tp.description || '—'}</td>
                  <td>{rolesStr}</td>
                  <td>{subjectsStr}</td>
                  {showSubscriptionColumn && <td>{subscriptionStr}</td>}
                  <td>{tp.addedBy || '—'}</td>
                  <td>{createdAtStr}</td>
                  <td>
                    {isSuperadmin ? (
                      <>
                        {/* Superadmin: allow edit button only for global training paths */}
                        {tp.organization_id === null && (
                          <button
                            className="btn btn-sm btn-link text-info"
                            onClick={() => onEditClick(tp)}
                            title="Edit"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                        )}
                        {/* Clone button available for all records */}
                        {onCloneClick && (
                          <button
                            className="btn btn-sm btn-link text-info"
                            onClick={() => onCloneClick(tp)}
                            title="Clone"
                          >
                            <FontAwesomeIcon icon={faClone} />
                          </button>
                        )}
                      </>
                    ) : (
                      // For local admin: show edit button only for local (editable) records
                      tp.organization_id !== null && (
                        <button
                          className="btn btn-sm btn-link text-info"
                          onClick={() => onEditClick(tp)}
                          title="Edit"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                      )
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

TrainingPathTable.propTypes = {
  trainingPaths: PropTypes.array.isRequired,
  selectedTrainingPaths: PropTypes.arrayOf(PropTypes.string).isRequired,
  onRowClick: PropTypes.func.isRequired,
  onEditClick: PropTypes.func.isRequired,
  onCloneClick: PropTypes.func,
  columnFilters: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    role: PropTypes.string,
    subjects: PropTypes.string,
    addedBy: PropTypes.string,
    createdAt: PropTypes.string,
    subscription: PropTypes.string,
  }).isRequired,
  onColumnFilterChange: PropTypes.func.isRequired,
  onToggleSelectAll: PropTypes.func.isRequired,
  allSelected: PropTypes.bool.isRequired,
  showSubscriptionColumn: PropTypes.bool,
  isSuperadmin: PropTypes.bool,
};

export default TrainingPathTable;