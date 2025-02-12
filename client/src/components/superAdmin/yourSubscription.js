import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { getSubscriptions } from '../../auth/subscriptionActions';
import {
  upgradeOrganizationSubscription,
  cancelOrganizationSubscription,
} from '../../auth/organizationActions';
import PropTypes from 'prop-types';
import '../../style/yourSubscription.scss';

const YourSubscription = ({
  subscriptions,
  getSubscriptions,
  organization,
  upgradeOrganizationSubscription,
  cancelOrganizationSubscription,
}) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [upgradeOptions, setUpgradeOptions] = useState([]);
  const [selectedSubId, setSelectedSubId] = useState('');
  const [billingTerm, setBillingTerm] = useState('monthly');

  // Clear messages
  useEffect(() => {
    let timer;
    if (successMsg || errorMsg) {
      timer = setTimeout(() => {
        setSuccessMsg('');
        setErrorMsg('');
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [successMsg, errorMsg]);

  useEffect(() => {
    getSubscriptions();
  }, [getSubscriptions]);

  const currentSubscription = subscriptions.find(
    (sub) => sub._id === organization?.subscription?._id
  );

  if (!currentSubscription) {
    return (
      <div className="container">
        <h2>Your Subscription</h2>
        {successMsg && <div className="alert alert-success">{successMsg}</div>}
        {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
        <p>No subscription details available.</p>
      </div>
    );
  }

  const currName = currentSubscription.name.toLowerCase();
  const canCancel = currName !== 'free';
  const canUpgrade = currName !== 'enterprise';

  // Compute Next Billing Date if not free
  let nextBillingDate = null;
  if (canCancel && organization.subscriptionStartDate) {
    const startDate = new Date(organization.subscriptionStartDate);
    nextBillingDate = new Date(startDate);

    if (organization.billingTerm === 'yearly') {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    } else {
      // monthly default
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    }
  }

  /****************************
   * CANCEL
   ****************************/
  const handleCancelClick = () => setShowCancelModal(true);

  const confirmCancel = async () => {
    try {
      await cancelOrganizationSubscription(organization._id);
      setSuccessMsg('Subscription cancellation scheduled.');
    } catch (error) {
      console.error(error);
      setErrorMsg('Error canceling subscription. Please try again.');
    }
    setShowCancelModal(false);
  };

  /****************************
   * UPGRADE
   ****************************/
  const handleUpgradeClick = () => {
    let possible = [];
    if (currName === 'free') {
      possible = subscriptions.filter((s) =>
        ['Standard', 'Enterprise'].includes(s.name)
      );
    } else if (currName === 'standard') {
      possible = subscriptions.filter((s) => s.name === 'Enterprise');
    }
    setUpgradeOptions(possible);
    if (possible.length) setSelectedSubId(possible[0]._id);
    setBillingTerm('monthly');
    setShowUpgradeModal(true);
  };

  const confirmUpgrade = async () => {
    if (!selectedSubId) {
      setErrorMsg('Please select a subscription to upgrade to.');
      return;
    }
    try {
      await upgradeOrganizationSubscription(
        organization._id,
        selectedSubId,
        billingTerm
      );
      setSuccessMsg('Subscription upgraded successfully!');
    } catch (err) {
      console.error(err);
      setErrorMsg('Error upgrading subscription. Please try again.');
    }
    setShowUpgradeModal(false);
  };

  return (
    <div className="container your-sub-container">
      <h2>Your Subscription</h2>
      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      <div className="card current-subscription-card">
        <div className="card-body">
          <h4 className="card-title">{currentSubscription.name}</h4>
          <p className="sub-desc">{currentSubscription.description || 'N/A'}</p>
          <p>
            <strong>Features:</strong> {currentSubscription.features?.join(', ')}
          </p>
          <p>
            <strong>Modules:</strong> {currentSubscription.modules?.join(', ')}
          </p>
          <p>
            <strong>Active:</strong> {currentSubscription.isActive ? 'Yes' : 'No'}
          </p>

          {/* Show subscriptionStartDate if present */}
          <p>
            <strong>Start Date:</strong>{' '}
            {organization.subscriptionStartDate
              ? new Date(organization.subscriptionStartDate).toLocaleDateString()
              : 'N/A'}
          </p>

          <p>
            <strong>Billing Term:</strong> {organization.billingTerm || 'N/A'}
          </p>

          {nextBillingDate && (
            <p>
              <strong>Next Billing Date:</strong>{' '}
              {nextBillingDate.toLocaleDateString()}
            </p>
          )}

          <div className="mt-3">
            {canUpgrade && (
              <button className="btn btn-primary me-3" onClick={handleUpgradeClick}>
                Upgrade
              </button>
            )}
            {canCancel && (
              <button className="btn btn-danger" onClick={handleCancelClick}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CANCEL MODAL */}
      {showCancelModal && (
        <div className="modal">
          <div className="modal-content">
            <h4>Cancel Subscription</h4>
            <p>
              Are you sure you want to cancel <b>{currentSubscription.name}</b>?
            </p>
            <div className="d-flex mt-3">
              <button className="btn btn-danger me-2" onClick={confirmCancel}>
                Yes, Cancel
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowCancelModal(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPGRADE MODAL */}
      {showUpgradeModal && (
        <div className="modal">
          <div className="modal-content upgrade-modal-content">
            <h4>Upgrade Subscription</h4>
            <p>Select which subscription you want to upgrade to:</p>

            {upgradeOptions.length === 0 ? (
              <p>No higher-tier subscriptions available.</p>
            ) : (
              <div className="upgrade-options-list">
                {upgradeOptions.map((sub) => (
                  <div
                    key={sub._id}
                    className={`upgrade-option-card ${
                      selectedSubId === sub._id ? 'selected' : ''
                    }`}
                    onClick={() => setSelectedSubId(sub._id)}
                  >
                    <h5>{sub.name}</h5>
                    <p className="sub-desc">{sub.description}</p>
                    <p className="cost-info">
                      <strong>Monthly Cost:</strong> ${sub.priceMonthly} <br />
                      <strong>Yearly Cost:</strong> ${sub.priceYearly}
                    </p>
                    <p>
                      <strong>Features:</strong> {sub.features?.join(', ')}
                    </p>
                    <p>
                      <strong>Modules:</strong> {sub.modules?.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {upgradeOptions.length > 0 && (
              <>
                <p className="mt-3">Select Billing Term:</p>
                <select
                  className="form-control"
                  value={billingTerm}
                  onChange={(e) => setBillingTerm(e.target.value)}
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </>
            )}

            <div className="d-flex mt-4">
              <button
                className="btn btn-primary me-2"
                onClick={confirmUpgrade}
                disabled={!selectedSubId}
              >
                Confirm Upgrade
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowUpgradeModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

YourSubscription.propTypes = {
  subscriptions: PropTypes.array.isRequired,
  getSubscriptions: PropTypes.func.isRequired,
  upgradeOrganizationSubscription: PropTypes.func.isRequired,
  cancelOrganizationSubscription: PropTypes.func.isRequired,
  organization: PropTypes.shape({
    _id: PropTypes.string,
    subscription: PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
    }),
    billingTerm: PropTypes.string,
    subscriptionStartDate: PropTypes.string,
  }),
};

const mapStateToProps = (state) => ({
  subscriptions: state.subscription.subscriptions || [],
  organization: state.auth.profile?.organization, 
});

export default connect(mapStateToProps, {
  getSubscriptions,
  upgradeOrganizationSubscription,
  cancelOrganizationSubscription,
})(YourSubscription);