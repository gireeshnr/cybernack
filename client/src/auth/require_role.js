import React, { useEffect } from 'react';
import { connect } from 'react-redux'; // Corrected import
import { useNavigate } from 'react-router-dom'; // Corrected import
import PropTypes from 'prop-types'; // Import PropTypes

const RequireRole = ({ Component, authenticated, role, allowedRoles, ...props }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!authenticated || !allowedRoles.includes(role)) {
      navigate('/signin');
    }
  }, [authenticated, role, allowedRoles, navigate]);

  return authenticated && allowedRoles.includes(role) ? <Component {...props} /> : null;
};

// Define PropTypes
RequireRole.propTypes = {
  Component: PropTypes.elementType.isRequired, // A React component type
  authenticated: PropTypes.bool.isRequired,   // Boolean indicating authentication status
  role: PropTypes.string.isRequired,          // User's role as a string
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired, // Array of allowed roles
};

// Map state to props
const mapStateToProps = (state) => ({
  authenticated: state.auth.authenticated,
  role: state.auth.profile?.role, // Assuming the role is stored in the user's profile
});

export default connect(mapStateToProps)(RequireRole);