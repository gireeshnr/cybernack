// client/src/components/AppSettings/Industries/IndustryTable.js
import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

const IndustryTable = ({
  industries,
  selectedIndustries,
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
            <th>Industry Name</th>
            <th>Description</th>
            {isSuperadmin && <th>Subscription</th>}
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
          {industries.length === 0 ? (
            <tr>
              <td colSpan={isSuperadmin ? 7 : 6} className="text-center">
                No industries available.
              </td>
            </tr>
          ) : (
            industries.map((industry) => {
              let subscriptionLabel = '—';
              if (isSuperadmin && industry.subscription_id && typeof industry.subscription_id === 'object') {
                subscriptionLabel = industry.subscription_id.name || '—';
              }
              return (
                <tr key={industry._id} className={selectedIndustries.includes(industry._id) ? 'table-primary' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIndustries.includes(industry._id)}
                      onChange={() => onRowClick(industry._id)}
                    />
                  </td>
                  <td>{industry.name}</td>
                  <td>{industry.description || '—'}</td>
                  {isSuperadmin && <td>{subscriptionLabel}</td>}
                  <td>{industry.creatorRole === 'superadmin' ? 'Cybernack' : (industry.addedBy || '—')}</td>
                  <td>{industry.createdAt ? new Date(industry.createdAt).toLocaleDateString() : ''}</td>
                  <td>
                    {/* Show the edit icon only if:
                        - For local admins: only allow editing if the record was created by an admin.
                        - For superadmin: only show edit icon on global records (created by superadmin) */}
                    {((!isSuperadmin && industry.creatorRole === 'admin') ||
                      (isSuperadmin && industry.creatorRole === 'superadmin')) && (
                      <button
                        className="btn btn-sm"
                        onClick={() => onEditClick(industry)}
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

IndustryTable.propTypes = {
  industries: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      subscription_id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({ _id: PropTypes.string, name: PropTypes.string }),
      ]),
      createdAt: PropTypes.string,
      addedBy: PropTypes.string,
      creatorRole: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedIndustries: PropTypes.arrayOf(PropTypes.string).isRequired,
  onRowClick: PropTypes.func.isRequired,
  onEditClick: PropTypes.func.isRequired,
  columnFilters: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    subscription: PropTypes.string,
    addedBy: PropTypes.string,
    createdAt: PropTypes.string,
  }).isRequired,
  onColumnFilterChange: PropTypes.func.isRequired,
  onToggleSelectAll: PropTypes.func.isRequired,
  allSelected: PropTypes.bool.isRequired,
  isSuperadmin: PropTypes.bool.isRequired,
};

export default IndustryTable;