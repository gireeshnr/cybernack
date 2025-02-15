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
}) => {
  return (
    <div className="table-responsive">
      <table className="table table-hover table-striped">
        <thead>
          <tr>
            <th></th>
            <th>Subject Name</th>
            <th>Domain</th>
            <th>Subscription</th>
            <th>Added By</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
          {/* Filter row with "Select All" checkbox in first column */}
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
                placeholder="Filter Domain"
                value={columnFilters.domain}
                onChange={(e) => onColumnFilterChange('domain', e.target.value)}
                className="form-control form-control-sm"
              />
            </th>
            <th>
              <input
                type="text"
                placeholder="Filter Subscription"
                value={columnFilters.subscription}
                onChange={(e) => onColumnFilterChange('subscription', e.target.value)}
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
          {subjects.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center">
                No subjects available.
              </td>
            </tr>
          ) : (
            subjects.map((subject) => {
              // Domain label
              const domainLabel =
                subject.domain_id && typeof subject.domain_id === 'object'
                  ? subject.domain_id.name
                  : subject.domain_id || '—';

              // Subscription label
              let subscriptionLabel = '—';
              if (subject.subscription_id) {
                subscriptionLabel =
                  typeof subject.subscription_id === 'object'
                    ? subject.subscription_id.name || '—'
                    : subject.subscription_id;
              }

              return (
                <tr
                  key={subject._id}
                  className={selectedSubjects.includes(subject._id) ? 'table-primary' : ''}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(subject._id)}
                      onChange={() => onRowClick(subject._id)}
                    />
                  </td>
                  <td>{subject.name}</td>
                  <td>{domainLabel}</td>
                  <td>{subscriptionLabel}</td>
                  <td>{subject.addedBy || '—'}</td>
                  <td>
                    {subject.createdAt ? new Date(subject.createdAt).toLocaleDateString() : ''}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm"
                      onClick={() => onEditClick(subject)}
                      title="Edit"
                      style={{ backgroundColor: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
                    >
                      <FontAwesomeIcon icon={faEdit} style={{ fontSize: '0.8rem' }} />
                    </button>
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
      ]),
      subscription_id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({ _id: PropTypes.string, name: PropTypes.string }),
      ]),
      createdAt: PropTypes.string,
      addedBy: PropTypes.string,
    })
  ).isRequired,
  selectedSubjects: PropTypes.arrayOf(PropTypes.string).isRequired,
  onRowClick: PropTypes.func.isRequired,
  onEditClick: PropTypes.func.isRequired,
  columnFilters: PropTypes.shape({
    name: PropTypes.string,
    domain: PropTypes.string,
    subscription: PropTypes.string,
    addedBy: PropTypes.string,
    createdAt: PropTypes.string,
  }).isRequired,
  onColumnFilterChange: PropTypes.func.isRequired,
  onToggleSelectAll: PropTypes.func.isRequired,
  allSelected: PropTypes.bool.isRequired,
};

export default SubjectTable;