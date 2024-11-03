import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { updateOrganization } from '../../auth/actions';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditOrganizationModal = ({ organization, onClose, updateOrganization }) => {
  const [orgName, setOrgName] = useState(organization.name || '');
  const [subscription, setSubscription] = useState(organization.subscription || 'Standard');
  const [isActive, setIsActive] = useState(organization.isActive || false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setOrgName(organization.name || '');
    setSubscription(organization.subscription || 'Standard');
    setIsActive(organization.isActive || false);
  }, [organization]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateOrganization(organization._id, {
        name: orgName,
        subscription,
        isActive,
      });
      toast.success('Organization updated successfully!');
      onClose(); // Close the modal after successful update
    } catch (error) {
      toast.error('Error updating organization. Please try again.');
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
              className="form-control"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Subscription Plan:</label>
            <select
              className="form-control"
              value={subscription}
              onChange={(e) => setSubscription(e.target.value)}
            >
              <option value="Standard">Standard</option>
              <option value="Premium">Premium</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
          <div className="form-group">
            <label>Active Status:</label>
            <select
              className="form-control"
              value={isActive ? 'true' : 'false'}
              onChange={(e) => setIsActive(e.target.value === 'true')}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default connect(null, { updateOrganization })(EditOrganizationModal);