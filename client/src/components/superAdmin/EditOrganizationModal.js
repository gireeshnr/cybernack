import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { updateOrganization } from '../../auth/actions';
import { toast } from 'react-hot-toast';

const EditOrganizationModal = ({ organization, onClose, updateOrganization, subscriptions }) => {
  const [formState, setFormState] = useState({
    orgName: '',
    subscription: '',
    isActive: false,
    billingTerm: '',
    subscriptionStartDate: '',
    subscriptionEndDate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // On open, sync with the org details
    if (organization) {
      setFormState({
        orgName: organization.name || '',
        subscription: organization.subscription?._id || '',
        isActive: organization.isActive || false,
        billingTerm: organization.billingTerm || '',
        subscriptionStartDate: organization.subscriptionStartDate
          ? organization.subscriptionStartDate.slice(0, 10)  // 'YYYY-MM-DD'
          : '',
        subscriptionEndDate: organization.subscriptionEndDate
          ? organization.subscriptionEndDate.slice(0, 10)
          : '',
      });
    }
  }, [organization]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateOrganization(organization._id, {
        orgName: formState.orgName,
        subscription: formState.subscription,
        isActive: formState.isActive,
        billingTerm: formState.billingTerm,
        subscriptionStartDate: formState.subscriptionStartDate,
        subscriptionEndDate: formState.subscriptionEndDate,
      });
      toast.success('Organization updated successfully!');
      onClose();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Error updating organization. Please try again.';
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
              <option value="">Select Subscription</option>
              {subscriptions.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Active Status:</label>
            <select
              name="isActive"
              className="form-control"
              value={formState.isActive ? 'true' : 'false'}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  isActive: e.target.value === 'true',
                }))
              }
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          {/* NEW FIELDS */}
          <div className="form-group">
            <label>Billing Term</label>
            <select
              name="billingTerm"
              className="form-control"
              value={formState.billingTerm}
              onChange={handleChange}
            >
              <option value="">(none)</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div className="form-group">
            <label>Subscription Start Date</label>
            <input
              type="date"
              name="subscriptionStartDate"
              className="form-control"
              value={formState.subscriptionStartDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Subscription End Date</label>
            <input
              type="date"
              name="subscriptionEndDate"
              className="form-control"
              value={formState.subscriptionEndDate}
              onChange={handleChange}
            />
          </div>
          {/* END NEW FIELDS */}

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
    subscription: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
    ]),
    isActive: PropTypes.bool,
    billingTerm: PropTypes.string,
    subscriptionStartDate: PropTypes.string,
    subscriptionEndDate: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  updateOrganization: PropTypes.func.isRequired,
  subscriptions: PropTypes.array.isRequired,
};

export default connect(null, { updateOrganization })(EditOrganizationModal);