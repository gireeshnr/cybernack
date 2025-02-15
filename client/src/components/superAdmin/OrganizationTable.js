// client/src/components/superAdmin/OrganizationTable.js
import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

const OrganizationTable = ({
  organizations,
  selectedOrgs,
  onRowClick,
  onEditClick,
  columnFilters,
  onColumnFilterChange,
  onToggleSelectAll,
  allSelected,
}) => {
  return (
    <div className="table-responsive">
      <table className="table table-hover">
        <thead>
          <tr>
            <th>Select</th>
            <th>Organization Name</th>
            <th>Subscription Plan</th>
            <th>Billing Term</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
          {/* Filter row */}
          <tr>
            <th>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleSelectAll}
                style={{ marginRight: '4px' }}
              />
              <label style={{ fontSize: '0.8rem', margin: 0 }}>Select All</label>
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
                placeholder="Filter Subscription"
                value={columnFilters.subscription}
                onChange={(e) => onColumnFilterChange('subscription', e.target.value)}
                className="form-control form-control-sm"
              />
            </th>
            <th>
              <input
                type="text"
                placeholder="Filter Billing"
                value={columnFilters.billingTerm}
                onChange={(e) => onColumnFilterChange('billingTerm', e.target.value)}
                className="form-control form-control-sm"
              />
            </th>
            <th>
              <input
                type="text"
                placeholder="Filter Start Date"
                value={columnFilters.subscriptionStartDate}
                onChange={(e) => onColumnFilterChange('subscriptionStartDate', e.target.value)}
                className="form-control form-control-sm"
              />
            </th>
            <th>
              <input
                type="text"
                placeholder="Filter End Date"
                value={columnFilters.subscriptionEndDate}
                onChange={(e) => onColumnFilterChange('subscriptionEndDate', e.target.value)}
                className="form-control form-control-sm"
              />
            </th>
            <th>
              <input
                type="text"
                placeholder="Filter Active"
                value={columnFilters.isActive}
                onChange={(e) => onColumnFilterChange('isActive', e.target.value)}
                className="form-control form-control-sm"
              />
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {organizations.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center">
                No organizations available.
              </td>
            </tr>
          ) : (
            organizations.map((org) => {
              const selected = selectedOrgs.includes(org._id);
              return (
                <tr key={org._id} className={selected ? 'table-primary' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => onRowClick(org._id)}
                    />
                  </td>
                  <td>{org.name}</td>
                  <td>{org.subscriptionName || 'N/A'}</td>
                  <td>{org.billingTerm || 'N/A'}</td>
                  <td>
                    {org.subscriptionStartDate
                      ? new Date(org.subscriptionStartDate).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td>
                    {org.subscriptionEndDate
                      ? new Date(org.subscriptionEndDate).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td>{org.isActive ? 'Active' : 'Inactive'}</td>
                  <td>
                    <button
                      className="btn btn-link"
                      onClick={() => onEditClick(org)}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                      title="Edit"
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

OrganizationTable.propTypes = {
  organizations: PropTypes.array.isRequired,
  selectedOrgs: PropTypes.array.isRequired,
  onRowClick: PropTypes.func.isRequired,
  onEditClick: PropTypes.func.isRequired,
  onToggleSelectAll: PropTypes.func.isRequired,
  allSelected: PropTypes.bool.isRequired,
  columnFilters: PropTypes.shape({
    name: PropTypes.string,
    subscription: PropTypes.string,
    billingTerm: PropTypes.string,
    subscriptionStartDate: PropTypes.string,
    subscriptionEndDate: PropTypes.string,
    isActive: PropTypes.string,
  }).isRequired,
};

export default OrganizationTable;