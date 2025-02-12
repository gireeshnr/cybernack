import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

const SubjectTable = ({
  subjects,
  selectedSubjects,
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
            <th>Domains</th>
            {/* NEW: Subscription Column */}
            <th>Subscription</th>
            <th>Created At</th>
            <th>Actions</th>
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
              // Construct domains label
              const domainsLabel =
                Array.isArray(subject.domains) && subject.domains.length > 0
                  ? subject.domains
                      .map((dom) => (typeof dom === 'object' ? dom.name : dom))
                      .join(', ')
                  : '—';

              // Construct subscription label
              let subscriptionLabel = '—';
              if (subject.subscription_id) {
                if (typeof subject.subscription_id === 'object') {
                  subscriptionLabel = subject.subscription_id.name || '—';
                } else {
                  subscriptionLabel = subject.subscription_id;
                }
              }

              return (
                <tr
                  key={subject._id}
                  className={
                    selectedSubjects.includes(subject._id) ? 'table-primary' : ''
                  }
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(subject._id)}
                      onChange={() => onRowClick(subject._id)}
                    />
                  </td>
                  <td>{subject.name}</td>
                  <td>{subject.description || '—'}</td>
                  <td>{domainsLabel}</td>
                  {/* Display subscription label */}
                  <td>{subscriptionLabel}</td>
                  <td>
                    {subject.createdAt
                      ? new Date(subject.createdAt).toLocaleDateString()
                      : ''}
                  </td>
                  <td>
                    {/* Icon only, transparent background */}
                    <button
                      onClick={() => onEditClick(subject)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                      }}
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
      // Could be an array of domain IDs or domain objects
      domains: PropTypes.array,
      // subscription can be an object or string
      subscription_id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          _id: PropTypes.string,
          name: PropTypes.string,
        }),
      ]),
      createdAt: PropTypes.string,
    })
  ).isRequired,
  selectedSubjects: PropTypes.arrayOf(PropTypes.string).isRequired,
  onRowClick: PropTypes.func.isRequired,
  onEditClick: PropTypes.func.isRequired,
};

export default SubjectTable;
