import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { signUserOut } from '../../auth/actions'; // Corrected path to actions.js

const Signout = (props) => {
  useEffect(() => {
    props.signUserOut();
  }, []);

  return (
    <div>
      <h1>Hope to see you soon!</h1>
    </div>
  );
}

export default connect(null, { signUserOut })(Signout);