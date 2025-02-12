import React from 'react';
import PropTypes from 'prop-types';

const IndustryTable = ({ industries, onEdit, onDelete }) => (
  <table className="table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Description</th>
        {/* NEW: Subscription Column */}
        <th>Subscription</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {industries.map((industry) => {
        // If subscription_id is an object, show subscription_id.name; otherwise show the raw _id or '-'
        let subscriptionLabel = '-';
        if (industry.subscription_id) {
          if (typeof industry.subscription_id === 'object') {
            subscriptionLabel = industry.subscription_id.name || '-';
          } else {
            // It's just an ID string (unpopulated)
            subscriptionLabel = industry.subscription_id;
          }
        }

        return (
          <tr key={industry._id}>
            <td>{industry.name}</td>
            <td>{industry.description}</td>
            {/* Display subscription name or ID */}
            <td>{subscriptionLabel}</td>
            <td>
              <button className="btn btn-sm btn-primary" onClick={() => onEdit(industry)}>
                Edit
              </button>
              <button className="btn btn-sm btn-danger" onClick={() => onDelete(industry._id)}>
                Delete
              </button>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
);

IndustryTable.propTypes = {
  industries: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      // subscription_id might be an object or string
      subscription_id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          _id: PropTypes.string,
          name: PropTypes.string,
        }),
      ]),
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default IndustryTable;
