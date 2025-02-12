import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const RequireRole = ({ Component, authenticated, role, allowedRoles, ...props }) => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Authenticated:', authenticated, 'Role:', role); // Debug: Validate role and authentication
    if (!authenticated || !allowedRoles.includes(role)) {
      navigate('/signin');
    }
  }, [authenticated, role, allowedRoles, navigate]);

  return authenticated && allowedRoles.includes(role) ? <Component {...props} /> : null;
};

RequireRole.propTypes = {
  Component: PropTypes.elementType.isRequired,
  authenticated: PropTypes.bool.isRequired,
  role: PropTypes.string.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const mapStateToProps = (state) => ({
  authenticated: state.auth.authenticated,
  role: state.auth.profile?.role,
});

export default connect(mapStateToProps)(RequireRole);