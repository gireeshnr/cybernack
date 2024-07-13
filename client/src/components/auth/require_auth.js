import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const AuthComponent = ({ Component, authenticated, ...props }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!authenticated) {
      navigate('/signin');
    }
  }, [authenticated, navigate]);

  return authenticated ? <Component {...props} /> : null;
};

const mapStateToProps = (state) => ({
  authenticated: state.auth.authenticated,
});

export default connect(mapStateToProps)(AuthComponent);
