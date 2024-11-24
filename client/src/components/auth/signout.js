import React, { useEffect } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { connect } from 'react-redux';
import { signUserOut } from '../../auth/actions'; // Corrected path to actions.js

const Signout = ({ signUserOut }) => {
  useEffect(() => {
    signUserOut();
  }, [signUserOut]);

  return (
    <div>
      <h1>Hope to see you soon!</h1>
    </div>
  );
};

// Add PropTypes validation
Signout.propTypes = {
  signUserOut: PropTypes.func.isRequired, // Function to sign the user out
};

export default connect(null, { signUserOut })(Signout);