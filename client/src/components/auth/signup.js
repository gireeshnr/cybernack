import React, { useState } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { connect } from 'react-redux';
import { signUserUp } from '../../auth/actions';
import CenterCard from '../CenterCard'; // Use the new consolidated CenterCard component
import useForm from '../../use-form-react';
import { toast } from 'react-hot-toast'; // Import react-hot-toast
import { useNavigate } from 'react-router-dom';

const Signup = ({ signUserUp }) => { // Destructure signUserUp for cleaner code
  const [errMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  const options = {
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      org: '',
    },
    callback: (inputs, e) => {
      if (e) e.preventDefault(); // Ensure the event is passed correctly to prevent default form behavior

      setLoading(true); // Start loading
      signUserUp({ ...inputs })
        .then(() => {
          setLoading(false); // Stop loading

          // Show success toast with a redirect
          toast.success('You signed up successfully! Please check your email to activate your account.', {
            duration: 5000,
          });
          setTimeout(() => navigate('/signin'), 5000);
        })
        .catch((err) => {
          setLoading(false); // Stop loading
          setErrorMsg(err.response?.data || 'Error signing up. Please try again.');
        });
    },
    debug: false,
  };

  const { onSubmit, onChange, inputs, dirty, submitting } = useForm('SignupForm', options);

  return (
    <CenterCard showLogo={true}> {/* Use CenterCard with the logo for signup */}
      <h2 className="form-header">Sign Up</h2>
      <div className="centered-form">
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>First Name:</label>
            <input
              name="firstName"
              value={inputs.firstName}
              type="text"
              onChange={onChange}
              className="form-control form-control-lg"
              placeholder="First Name"
              required
            />
          </div>
          <div className="form-group">
            <label>Last Name:</label>
            <input
              name="lastName"
              value={inputs.lastName}
              type="text"
              onChange={onChange}
              className="form-control form-control-lg"
              placeholder="Last Name"
              required
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              name="email"
              value={inputs.email}
              type="email"
              onChange={onChange}
              className="form-control form-control-lg"
              placeholder="sample@email.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Organization:</label>
            <input
              name="org"
              value={inputs.org}
              type="text"
              onChange={onChange}
              className="form-control form-control-lg"
              placeholder="Organization"
              required
            />
          </div>
          {errMsg && (
            <div className="alert alert-warning">
              <strong>Oops!</strong> {errMsg}
            </div>
          )}
          <div style={{ paddingTop: '30px' }}>
            <button
              type="submit"
              className="btn btn-primary btn-lg btn-block"
              disabled={!dirty || submitting || loading}
            >
              {loading ? (
                <div
                  className="spinner-border text-light"
                  role="status"
                  style={{ width: '20px', height: '20px' }}
                >
                  <span className="sr-only">Loading...</span>
                </div>
              ) : (
                'Sign Up'
              )}
            </button>
          </div>
        </form>
      </div>
    </CenterCard>
  );
};

// Add PropTypes validation
Signup.propTypes = {
  signUserUp: PropTypes.func.isRequired, // Function to sign up a user
};

export default connect(null, { signUserUp })(Signup);