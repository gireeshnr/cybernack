import React, { useEffect } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes for validation
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const AuthComponent = ({ Component, authenticated, allowedRoles, role, ...props }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!authenticated) {
      navigate('/signin');
    } else if (allowedRoles && !allowedRoles.includes(role)) {
      navigate('/signin'); // Or navigate to an unauthorized page
    }
  }, [authenticated, role, allowedRoles, navigate]);

  return authenticated ? <Component {...props} /> : null;
};

AuthComponent.propTypes = {
  Component: PropTypes.elementType.isRequired, // Ensure Component is a valid React component
  authenticated: PropTypes.bool.isRequired, // Ensure authenticated is a boolean
  allowedRoles: PropTypes.arrayOf(PropTypes.string), // Validate allowedRoles as an array of strings
  role: PropTypes.string, // Validate role as a string
};

const mapStateToProps = (state) => ({
  authenticated: state.auth.authenticated,
  role: state.auth.profile?.role, // Get role from auth.profile
});

export default connect(mapStateToProps)(AuthComponent);