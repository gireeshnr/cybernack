// client/src/components/CenterCard.js

import React from 'react';
import Logo from '../statics/Logo.png'; // Ensure the correct path to the logo

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