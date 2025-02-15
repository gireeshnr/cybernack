import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

const DomainTable = ({
  domains,
  selectedDomains,
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
            <th>Industries</th>
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
              <label htmlFor="selectAll" className="ms-1" style={{ fontSize: '0.8rem' }}>
                Select All
              </label>
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
                placeholder="Filter Industries"
                value={columnFilters.industries}
                onChange={(e) => onColumnFilterChange('industries', e.target.value)}
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
          {domains.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center">
                No domains available.
              </td>
            </tr>
          ) : (
            domains.map((domain) => {
              const industryNames = Array.isArray(domain.industries)
                ? domain.industries
                    .map((ind) => (typeof ind === 'object' ? ind.name : ind))
                    .join(', ')
                : '—';
              let subscriptionLabel = '—';
              if (domain.subscription_id) {
                if (typeof domain.subscription_id === 'object') {
                  subscriptionLabel = domain.subscription_id.name || '—';
                } else {
                  subscriptionLabel = domain.subscription_id;
                }
              }
              return (
                <tr
                  key={domain._id}
                  className={selectedDomains.includes(domain._id) ? 'table-primary' : ''}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedDomains.includes(domain._id)}
                      onChange={() => onRowClick(domain._id)}
                    />
                  </td>
                  <td>{domain.name}</td>
                  <td>{domain.description}</td>
                  <td>{industryNames}</td>
                  <td>{subscriptionLabel}</td>
                  <td>{domain.addedBy || '—'}</td>
                  <td>
                    {domain.createdAt ? new Date(domain.createdAt).toLocaleDateString() : ''}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm"
                      onClick={() => onEditClick(domain)}
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

DomainTable.propTypes = {
  domains: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      industries: PropTypes.array,
      subscription_id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({ _id: PropTypes.string, name: PropTypes.string }),
      ]),
      createdAt: PropTypes.string,
      addedBy: PropTypes.string,
    })
  ).isRequired,
  selectedDomains: PropTypes.arrayOf(PropTypes.string).isRequired,
  onRowClick: PropTypes.func.isRequired,
  onEditClick: PropTypes.func.isRequired,
  columnFilters: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    industries: PropTypes.string,
    subscription: PropTypes.string,
    addedBy: PropTypes.string,
    createdAt: PropTypes.string,
  }).isRequired,
  onColumnFilterChange: PropTypes.func.isRequired,
  onToggleSelectAll: PropTypes.func.isRequired,
  allSelected: PropTypes.bool.isRequired,
};

export default DomainTable;