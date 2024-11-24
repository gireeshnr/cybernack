import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import Logo from '../statics/Logo.png';

const CenterCard = ({ showLogo, children }) => (
  <div className="center-container">
    {showLogo && (
      <div className="logo-container">
        <img src={Logo} alt="Company Logo" className="company-logo" />
      </div>
    )}
    <div className="form-wrapper">
      {children}
    </div>
  </div>
);

// Define PropTypes
CenterCard.propTypes = {
  showLogo: PropTypes.bool, // Boolean to show/hide the logo
  children: PropTypes.node.isRequired, // Child components passed to the card
};

// Default props
CenterCard.defaultProps = {
  showLogo: false, // Default value for showLogo is false
};

export default CenterCard;