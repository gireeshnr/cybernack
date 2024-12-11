import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import useForm from '../../use-form-react';
import { signUserIn } from '../../auth/actions';
import CenterCard from '../CenterCard'; // Import CenterCard for centered layout

const Signin = ({ signUserIn, authError }) => {
  const [errMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const { onSubmit, onChange, inputs, dirty, submitting } = useForm('SigninForm', {
    initialValues: { email: '', password: '' },
    callback: () => {
      setErrorMsg('');
      return signUserIn(inputs)
        .then(() => navigate('/'))
        .catch(() => setErrorMsg(authError || 'Invalid email or password'));
    },
    debug: false, // Disable debug mode
  });

  useEffect(() => {
    if (authError) {
      console.error('Auth error from Redux:', authError);
    }
  }, [authError]);

  return (
    <CenterCard showLogo={true}>
      <h2 className="form-header">Sign In</h2>
      <form
        className="centered-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
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
          <label htmlFor="password">Password:</label>
          <input
            id="password"
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
          disabled={!dirty || submitting}
        >
          Sign In
        </button>
        <div className="text-center mt-3">
          <Link to="/forgot-password" className="nav-link">
            Forgot your password?
          </Link>
        </div>
        <div className="text-center mt-3">
          <NavLink to="/signup" className="nav-link">
            Don&apos;t have an account? Sign Up
          </NavLink>
        </div>
      </form>
    </CenterCard>
  );
};

Signin.propTypes = {
  signUserIn: PropTypes.func.isRequired,
  authError: PropTypes.string,
};

const mapStateToProps = (state) => ({
  authError: state.auth.errorMessage,
});

export default connect(mapStateToProps, { signUserIn })(Signin);