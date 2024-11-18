import React from 'react';
import Logo from '../statics/Logo.png';

const CenterCard = (props) => (
  <div className="center-container">
    {props.showLogo && (
      <div className="logo-container">
        <img src={Logo} alt="Company Logo" className="company-logo" />
      </div>
    )}
    <div className="form-wrapper">
      {props.children}
    </div>
  </div>
);

export default CenterCard;