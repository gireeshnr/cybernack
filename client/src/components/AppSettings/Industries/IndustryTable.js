import React from 'react';
import PropTypes from 'prop-types';

const IndustryTable = ({ industries, onEdit, onDelete }) => (
  <table className="table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Description</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {industries.map((industry) => (
        <tr key={industry._id}>
          <td>{industry.name}</td>
          <td>{industry.description}</td>
          <td>
            <button className="btn btn-sm btn-primary" onClick={() => onEdit(industry)}>
              Edit
            </button>
            <button className="btn btn-sm btn-danger" onClick={() => onDelete(industry._id)}>
              Delete
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

IndustryTable.propTypes = {
  industries: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default IndustryTable;