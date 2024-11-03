// client/src/components/auth/IntermediatePage.js

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Logo from '../../statics/Logo.png';

const IntermediatePage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/signin');
  };

  return (
    <div className="intermediate-page-container">
      <div className="logo-container">
        <img src={Logo} alt="Logo" className="company-logo" />
      </div>
      <div className="message-container">
        <h2>{state?.message}</h2>
        <button className="btn btn-primary" onClick={handleSignIn}>
          Click here to login
        </button>
      </div>
    </div>
  );
};

export default IntermediatePage;