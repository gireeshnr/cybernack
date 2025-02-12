import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

const DomainTable = ({
  domains,
  selectedDomains,
  onRowClick,
  onEditClick,
}) => {
  return (
    <div className="table-responsive">
      <table className="table table-hover table-striped">
        <thead>
          <tr>
            <th>Select</th>
            <th>Name</th>
            <th>Description</th>
            <th>Industries</th>
            <th>Subscription</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {domains.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center">
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
                  <td>
                    {domain.createdAt
                      ? new Date(domain.createdAt).toLocaleDateString()
                      : ''}
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onEditClick(domain)}
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
    })
  ).isRequired,
  selectedDomains: PropTypes.arrayOf(PropTypes.string).isRequired,
  onRowClick: PropTypes.func.isRequired,
  onEditClick: PropTypes.func.isRequired,
};

export default DomainTable;
