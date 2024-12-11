import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { updateOrganization } from '../../auth/actions';
import { toast } from 'react-hot-toast';

const EditOrganizationModal = ({ organization, onClose, updateOrganization }) => {
  const [formState, setFormState] = useState({
    orgName: '',
    subscription: 'Standard',
    isActive: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Sync form state with the organization details when the modal opens
    if (organization) {
      setFormState({
        orgName: organization.name || '',
        subscription: organization.subscription || 'Standard',
        isActive: organization.isActive || false,
      });
    }
  }, [organization]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: name === 'isActive' ? value === 'true' : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send update request
      await updateOrganization(organization._id, {
        name: formState.orgName,
        subscription: formState.subscription,
        isActive: formState.isActive,
      });
      toast.success('Organization updated successfully!');
      onClose(); // Close the modal after successful update
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error updating organization. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h4>Edit Organization</h4>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Organization Name:</label>
            <input
              type="text"
              name="orgName"
              className="form-control"
              value={formState.orgName}
              onChange={handleChange}
              placeholder="Enter organization name"
              required
            />
          </div>
          <div className="form-group">
            <label>Subscription Plan:</label>
            <select
              name="subscription"
              className="form-control"
              value={formState.subscription}
              onChange={handleChange}
            >
              <option value="Standard">Standard</option>
              <option value="Premium">Premium</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
          <div className="form-group">
            <label>Active Status:</label>
            <select
              name="isActive"
              className="form-control"
              value={formState.isActive ? 'true' : 'false'}
              onChange={handleChange}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

EditOrganizationModal.propTypes = {
  organization: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string,
    subscription: PropTypes.string,
    isActive: PropTypes.bool,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  updateOrganization: PropTypes.func.isRequired,
};

export default connect(null, { updateOrganization })(EditOrganizationModal);