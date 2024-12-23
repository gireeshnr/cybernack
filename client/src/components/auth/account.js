import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getUserProfile, updateUserProfile } from '../../auth/actions';
import CenterCard from '../CenterCard';
import useForm from '../../use-form-react';

const Account = ({ profile, getUserProfile, updateUserProfile }) => {
  const [editing, setEditing] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);

  const options = {
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: '',
      password: '',
      org: '',
    },
    callback: () => {
      updateUserProfile(inputs)
        .then(() => {
          setSuccessMsg('Profile updated successfully.');
          setEditing(false);
          setShowPasswordField(false);
          getUserProfile(); // Fetch updated profile
        })
        .catch((e) => {
          setErrMsg(`${e.response?.data || 'An error occurred'}. Please try again.`);
        });
    },
    debug: false,
  };

  const { setInputs, onSubmit, onChange, inputs, dirty, reset } = useForm('AdvanceForm', options);

  useEffect(() => {
    getUserProfile();
  }, [getUserProfile]);

  useEffect(() => {
    if (profile) {
      setInputs({
        firstName: profile.name.first,
        lastName: profile.name.last,
        email: profile.email,
        role: profile.role,
        password: '',
        org: profile.org, // Use org directly from the profile
      });
    }
  }, [profile, setInputs]);

  const handleChange = (event) => {
    setShowPasswordField(true);
    onChange(event);
  };

  const switchEditing = () => {
    setEditing(!editing);
    setSuccessMsg('');
  };

  const cancelForm = () => {
    setEditing(false);
    setShowPasswordField(false);
    setSuccessMsg('');
    reset();
    getUserProfile(); // Fetch user profile on cancel
  };

  const renderButtons = () => (
    editing ? (
      <div className="form-group">
        <button disabled={!dirty} type="submit" className="btn-lg btn btn-light btn-block">
          Save Changes
        </button>
        <button type="button" className="btn-lg btn btn-secondary btn-block" onClick={cancelForm}>
          Cancel
        </button>
      </div>
    ) : (
      <button type="button" className="btn btn-light btn-lg btn-block" onClick={switchEditing}>
        Update Information
      </button>
    )
  );

  const renderProfileForm = () => {
    if (!profile) return null;

    return (
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>First Name:</label>
          <input
            disabled={!editing}
            type="text"
            name="firstName"
            onChange={handleChange}
            value={inputs.firstName}
            className="form-control form-control-lg"
            placeholder="First Name"
            required
          />
        </div>
        <div className="form-group">
          <label>Last Name:</label>
          <input
            disabled={!editing}
            type="text"
            name="lastName"
            onChange={handleChange}
            value={inputs.lastName}
            className="form-control form-control-lg"
            placeholder="Last Name"
            required
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            disabled
            readOnly
            type="email"
            name="email"
            value={inputs.email}
            className="form-control form-control-lg"
            placeholder="sample@email.com"
          />
        </div>
        <div className="form-group">
          <label>Role:</label>
          <input
            disabled
            readOnly
            type="text"
            name="role"
            value={inputs.role}
            className="form-control form-control-lg"
            placeholder="Role"
          />
        </div>
        <div className="form-group">
          <label>Organization:</label>
          <input
            disabled
            readOnly
            type="text"
            name="org"
            value={inputs.org || 'No organization'}
            className="form-control form-control-lg"
            placeholder="Organization"
          />
        </div>
        {showPasswordField && (
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              onChange={handleChange}
              value={inputs.password}
              className={`form-control form-control-lg ${errMsg ? 'is-invalid' : ''}`}
              placeholder="Your password"
              required
            />
            {errMsg && <div className="invalid-feedback">{errMsg}</div>}
          </div>
        )}
        <div style={{ paddingTop: '30px' }}>{renderButtons()}</div>
      </form>
    );
  };

  return (
    <CenterCard showLogo={false}>
      <div className="card border-secondary">
        <h4 className="card-header">Account</h4>
        <div className="card-body">
          {successMsg && (
            <div className="alert alert-success">
              <strong>Success!</strong> {successMsg}
            </div>
          )}
          {renderProfileForm()}
        </div>
      </div>
    </CenterCard>
  );
};

Account.propTypes = {
  profile: PropTypes.shape({
    name: PropTypes.shape({
      first: PropTypes.string.isRequired,
      last: PropTypes.string.isRequired,
    }).isRequired,
    email: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    org: PropTypes.string,
  }),
  getUserProfile: PropTypes.func.isRequired,
  updateUserProfile: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  profile: state.auth.profile,
});

export default connect(mapStateToProps, { getUserProfile, updateUserProfile })(Account);