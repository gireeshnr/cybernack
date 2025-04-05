// client/src/components/AppSettings/Domains/DomainTable.js
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
  isSuperadmin,
  activeTab,
}) => {
  // For superadmins, show subscription column always.
  // For local admins, show subscription column only when activeTab is "local".
  const showSubscriptionColumn = isSuperadmin || activeTab === 'local';

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
            <th>Domain Name</th>
            <th>Description</th>
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
            {showSubscriptionColumn && (
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
          {domains.length === 0 ? (
            <tr>
              <td colSpan={showSubscriptionColumn ? 7 : 6} className="text-center">
                No domains available.
              </td>
            </tr>
          ) : (
            domains.map((domain) => {
              // Get subscription label
              let subscriptionLabel = '—';
              if (domain.subscription_id && typeof domain.subscription_id === 'object') {
                subscriptionLabel = domain.subscription_id.name || '—';
              }
              
              // Determine whether to show the edit icon.
              let showEdit = false;
              if (isSuperadmin) {
                showEdit = domain.creatorRole === 'superadmin';
              } else {
                showEdit = domain.creatorRole === 'admin';
              }

              return (
                <tr key={domain._id} className={selectedDomains.includes(domain._id) ? 'table-primary' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedDomains.includes(domain._id)}
                      onChange={() => onRowClick(domain._id)}
                    />
                  </td>
                  <td>{domain.name}</td>
                  <td>{domain.description || '—'}</td>
                  {showSubscriptionColumn && <td>{subscriptionLabel}</td>}
                  <td>{domain.creatorRole === 'superadmin' ? 'Cybernack' : (domain.addedBy || '—')}</td>
                  <td>{domain.createdAt ? new Date(domain.createdAt).toLocaleDateString() : ''}</td>
                  <td>
                    {showEdit && (
                      <button
                        className="btn btn-sm"
                        onClick={() => onEditClick(domain)}
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

DomainTable.propTypes = {
  domains: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      industry_id: PropTypes.oneOfType([
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
  selectedDomains: PropTypes.arrayOf(PropTypes.string).isRequired,
  onRowClick: PropTypes.func.isRequired,
  onEditClick: PropTypes.func.isRequired,
  columnFilters: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    industry: PropTypes.string,
    subscription: PropTypes.string,
    addedBy: PropTypes.string,
    createdAt: PropTypes.string,
  }).isRequired,
  onColumnFilterChange: PropTypes.func.isRequired,
  onToggleSelectAll: PropTypes.func.isRequired,
  allSelected: PropTypes.bool.isRequired,
  isSuperadmin: PropTypes.bool.isRequired,
  activeTab: PropTypes.string.isRequired,
};

export default DomainTable;