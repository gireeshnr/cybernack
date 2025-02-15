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
}) => {
  return (
    <div className="table-responsive">
      <table className="table table-hover table-striped">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Description</th>
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
          {industries.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center">
                No industries available.
              </td>
            </tr>
          ) : (
            industries.map((industry) => {
              let subscriptionLabel = '—';
              if (industry.subscription_id) {
                if (typeof industry.subscription_id === 'object') {
                  subscriptionLabel = industry.subscription_id.name || '—';
                } else {
                  subscriptionLabel = industry.subscription_id;
                }
              }
              return (
                <tr
                  key={industry._id}
                  className={selectedIndustries.includes(industry._id) ? 'table-primary' : ''}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIndustries.includes(industry._id)}
                      onChange={() => onRowClick(industry._id)}
                    />
                  </td>
                  <td>{industry.name}</td>
                  <td>{industry.description}</td>
                  <td>{subscriptionLabel}</td>
                  <td>{industry.addedBy || '—'}</td>
                  <td>
                    {industry.createdAt ? new Date(industry.createdAt).toLocaleDateString() : ''}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm"
                      onClick={() => onEditClick(industry)}
                      title="Edit"
                      style={{ backgroundColor: 'transparent', border: 'none', padding: 0 }}
                    >
                      <FontAwesomeIcon icon={faEdit} />
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
};

export default IndustryTable;