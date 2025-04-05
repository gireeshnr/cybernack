// client/src/components/AppSettings/Subjects/SubjectTable.js
import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

const SubjectTable = ({
  subjects,
  selectedSubjects,
  onRowClick,
  onEditClick,
  columnFilters,
  onColumnFilterChange,
  onToggleSelectAll,
  allSelected,
  isSuperadmin,
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
            <th>Subject Name</th>
            <th>Description</th>
            <th>Domain</th>
            {isSuperadmin && <th>Subscription</th>}
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
                placeholder="Filter Domain"
                value={columnFilters.domain}
                onChange={(e) => onColumnFilterChange('domain', e.target.value)}
                className="form-control form-control-sm"
              />
            </th>
            {isSuperadmin && (
              <th>
                <input
                  type="text"
                  placeholder="Filter Subscription"
                  value={columnFilters.subscription}
                  onChange={(e) => onColumnFilterChange('subscription', e.target.value)}
                  className="form-control form-control-sm"
                />
              </th>
            )}
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
          {subjects.length === 0 ? (
            <tr>
              <td colSpan={isSuperadmin ? "8" : "7"} className="text-center">
                No subjects available.
              </td>
            </tr>
          ) : (
            subjects.map(subject => {
              const domainLabel = subject.domain_id && typeof subject.domain_id === 'object'
                ? subject.domain_id.name || '—'
                : '—';
              const subscriptionLabel = subject.subscription_id && typeof subject.subscription_id === 'object'
                ? subject.subscription_id.name || '—'
                : '—';
              return (
                <tr key={subject._id} className={selectedSubjects.includes(subject._id) ? 'table-primary' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(subject._id)}
                      onChange={() => onRowClick(subject._id)}
                    />
                  </td>
                  <td>{subject.name}</td>
                  <td>{subject.description || '—'}</td>
                  <td>{domainLabel}</td>
                  {isSuperadmin && <td>{subscriptionLabel}</td>}
                  <td>{subject.creatorRole === 'superadmin' ? 'Cybernack' : (subject.addedBy || '—')}</td>
                  <td>{subject.createdAt ? new Date(subject.createdAt).toLocaleDateString() : ''}</td>
                  <td>
                    {(subject.creatorRole === 'admin' || isSuperadmin) && (
                      <button
                        className="btn btn-sm"
                        onClick={() => onEditClick(subject)}
                        title="Edit"
                        style={{ backgroundColor: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
                      >
                        <FontAwesomeIcon icon={faEdit} style={{ fontSize: '0.8rem' }} />
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

SubjectTable.propTypes = {
  subjects: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      domain_id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({ _id: PropTypes.string, name: PropTypes.string }),
      ]).isRequired,
      subscription_id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({ _id: PropTypes.string, name: PropTypes.string }),
      ]),
      createdAt: PropTypes.string,
      addedBy: PropTypes.string,
      creatorRole: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedSubjects: PropTypes.arrayOf(PropTypes.string).isRequired,
  onRowClick: PropTypes.func.isRequired,
  onEditClick: PropTypes.func.isRequired,
  columnFilters: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    domain: PropTypes.string,
    subscription: PropTypes.string,
    addedBy: PropTypes.string,
    createdAt: PropTypes.string,
  }).isRequired,
  onColumnFilterChange: PropTypes.func.isRequired,
  onToggleSelectAll: PropTypes.func.isRequired,
  allSelected: PropTypes.bool.isRequired,
  isSuperadmin: PropTypes.bool.isRequired,
};

export default SubjectTable;