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
            <th>Number of Users</th>
            <th>Active</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {organizations.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center">
                No organizations available.
              </td>
            </tr>
          ) : (
            organizations.map((org) => (
              <tr key={org._id} className={selectedOrgs.includes(org._id) ? 'selected' : ''}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedOrgs.includes(org._id)}
                    onChange={() => onRowClick(org._id)}
                    disabled={org.name === 'Cybernack'} // Disable selection for "Cybernack"
                  />
                </td>
                <td>{org.name}</td>
                <td>{org.subscriptionName}</td>
                <td>{org.numberOfUsers}</td>
                <td>{org.isActive ? 'Active' : 'Inactive'}</td>
                <td>{new Date(org.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onEditClick(org)}
                    disabled={org.name === 'Cybernack'} // Disable editing for "Cybernack"
                  >
                    <FontAwesomeIcon icon={faEdit} /> Edit
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

// Add PropTypes for validation
OrganizationTable.propTypes = {
  organizations: PropTypes.array.isRequired,
  selectedOrgs: PropTypes.array.isRequired,
  onRowClick: PropTypes.func.isRequired,
  onEditClick: PropTypes.func.isRequired,
};

export default OrganizationTable;