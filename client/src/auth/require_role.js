import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const RequireRole = ({ Component, authenticated, role, allowedRoles, ...props }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!authenticated || !allowedRoles.includes(role)) {
      navigate('/signin');
    }
  }, [authenticated, role, allowedRoles, navigate]);

  return authenticated && allowedRoles.includes(role) ? <Component {...props} /> : null;
};

const mapStateToProps = (state) => ({
  authenticated: state.auth.authenticated,
  role: state.user.profile?.role,  // Assuming the role is stored in the user's profile
});

export default connect(mapStateToProps)(RequireRole);