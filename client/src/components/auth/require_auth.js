import React, { useEffect } from 'react';
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

const mapStateToProps = (state) => ({
  authenticated: state.auth.authenticated,
  role: state.auth.profile?.role, // Get role from auth.profile
});

export default connect(mapStateToProps)(AuthComponent);