import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

const OrganizationTable = ({ organizations, selectedOrgs, onRowClick, onEditClick }) => {
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
                <tr
                  key={org._id}
                  className={selected ? 'selected' : ''}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => onRowClick(org._id)}
                      // optionally disable if org.name === 'Cybernack'
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
                      className="btn btn-secondary btn-sm"
                      onClick={() => onEditClick(org)}
                    >
                      <FontAwesomeIcon icon={faEdit} /> Edit
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
};

export default OrganizationTable;