import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { connect } from 'react-redux';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import useForm from '../../use-form-react';
import { signUserIn } from '../../auth/actions';
import CenterCard from '../CenterCard';

const Signin = ({ signUserIn, authError }) => {
  const [errMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const options = {
    initialValues: {
      email: '',
      password: ''
    },
    callback: () => {
      setErrorMsg('');
      return signUserIn(inputs)
        .then(() => {
          navigate('/');
        })
        .catch(() => {
          setErrorMsg(authError || 'Invalid email or password');
        });
    },
    debug: false // Disable debug mode for cleaner logs
  };

  const { onSubmit, onChange, inputs, dirty, submitting } = useForm('AdvanceForm', options);

  useEffect(() => {
    // Only log errors if needed for production issues
    if (authError) {
      console.error('Auth error from Redux:', authError);
    }
  }, [authError]);

  return (
    <CenterCard showLogo={true}>
      <h2 className="form-header">Sign In</h2>
      <div className="centered-form">
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
          <div className="form-group">
            <label>Email:</label>
            <input
              name="email"
              type="email"
              value={inputs.email}
              className="form-control form-control-lg"
              placeholder="sample@email.com"
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={inputs.password}
              className="form-control form-control-lg"
              placeholder="Your password"
              onChange={onChange}
              required
            />
          </div>
          {errMsg && (
            <div className="alert alert-danger">
              <strong>Error!</strong> {errMsg}
            </div>
          )}
          <button
            type="submit"
            className="btn btn-primary btn-lg btn-block"
            disabled={!dirty || submitting}>
            Sign In
          </button>
        </form>
        <div className="text-center mt-3">
          <Link to="/forgot-password" className="nav-link">Forgot your password?</Link>
        </div>
        <div className="text-center mt-3">
          <NavLink to="/signup" className="nav-link">Don't have an account? Sign Up</NavLink>
        </div>
      </div>
    </CenterCard>
  );
};

// Add PropTypes validation
Signin.propTypes = {
  signUserIn: PropTypes.func.isRequired, // Function for signing in the user
  authError: PropTypes.string, // Optional string for authentication error messages
};

const mapStateToProps = (state) => ({
  authError: state.auth.errorMessage,
});

export default connect(mapStateToProps, { signUserIn })(Signin);