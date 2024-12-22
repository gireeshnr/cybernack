import React from 'react';
import PropTypes from 'prop-types';
import Logo from '../statics/Logo.png';

const CenterCard = ({ showLogo = false, children }) => (
  <div className="center-container">
    {showLogo && (
      <div className="logo-container">
        <img src={Logo} alt="Company Logo" className="company-logo" />
      </div>
    )}
    <div className="form-wrapper">{children}</div>
  </div>
);

CenterCard.propTypes = {
  showLogo: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

export default CenterCard;