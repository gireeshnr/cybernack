import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const OrganizationForm = ({
  isEditing,
  data,
  setData,
  onSubmit,
  onCancel,
  isSubmitting,
  subscriptions,
}) => {
  // If user picks 'monthly'/'yearly' but hasn't typed end date, auto-calc
  useEffect(() => {
    // Log
    console.log('[CLIENT] Checking auto-calc for end date');
    if (!data.subscriptionStartDate || data.subscriptionEndDate) {
      // If there's no start date or the user already typed an end date, do nothing
      return;
    }
    if (data.billingTerm === 'monthly' || data.billingTerm === 'yearly') {
      const start = new Date(data.subscriptionStartDate);
      let daysToAdd = data.billingTerm === 'monthly' ? 30 : 365;
      const endTime = start.getTime() + daysToAdd * 24 * 60 * 60 * 1000;
      const endDate = new Date(endTime);
      const endDateStr = endDate.toISOString().slice(0, 10);

      setData((prev) => ({
        ...prev,
        subscriptionEndDate: endDateStr,
      }));
      console.log('[CLIENT] Auto-calculated end date to', endDateStr);
    }
  }, [
    data.billingTerm,
    data.subscriptionStartDate,
    data.subscriptionEndDate,
    setData,
  ]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className="modal">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <h4>{isEditing ? 'Edit Organization' : 'Add New Organization'}</h4>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <div className="form-group">
            <label>Organization Name:</label>
            <input
              type="text"
              name="orgName"
              className="form-control"
              value={data.orgName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Subscription Plan:</label>
            <select
              name="subscription"
              className="form-control"
              style={{ minWidth: '220px' }}
              value={data.subscription}
              onChange={handleChange}
              required
            >
              <option value="">Select Subscription</option>
              {subscriptions.length === 0 ? (
                <option disabled>No subscriptions available</option>
              ) : (
                subscriptions.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="form-group d-flex align-items-center">
            <label style={{ marginRight: '10px' }}>Active:</label>
            <input
              type="checkbox"
              name="isActive"
              className="form-check-input"
              checked={data.isActive}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Billing Term:</label>
            <select
              name="billingTerm"
              className="form-control"
              style={{ minWidth: '180px' }}
              value={data.billingTerm}
              onChange={handleChange}
            >
              <option value="">(none)</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div className="form-group">
            <label>Subscription Start Date:</label>
            <input
              type="date"
              name="subscriptionStartDate"
              className="form-control"
              value={data.subscriptionStartDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Subscription End Date:</label>
            <input
              type="date"
              name="subscriptionEndDate"
              className="form-control"
              value={data.subscriptionEndDate}
              onChange={handleChange}
            />
          </div>

          <div className="d-flex mt-3">
            <button
              type="submit"
              className="btn btn-primary me-3"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? isEditing
                  ? 'Updating...'
                  : 'Adding...'
                : isEditing
                ? 'Update'
                : 'Add'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ marginLeft: '8px' }}
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

OrganizationForm.propTypes = {
  isEditing: PropTypes.bool.isRequired,
  data: PropTypes.shape({
    orgName: PropTypes.string,
    subscription: PropTypes.string,
    isActive: PropTypes.bool,
    billingTerm: PropTypes.string,
    subscriptionStartDate: PropTypes.string,
    subscriptionEndDate: PropTypes.string,
  }).isRequired,
  setData: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  subscriptions: PropTypes.array.isRequired,
};

export default OrganizationForm;