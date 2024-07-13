import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import useForm from '../../use-form-react';
import { signUserIn } from '../../actions';
import CenterCard363 from '../centerCard363';
import Logo from '../../statics/Logo.png'; // Assuming the logo is in this path

const Signin = (props) => {
  const [errMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const options = {
    initialValues: {
      email: '',
      password: ''
    },
    callback: () => {
      setErrorMsg(''); // Clear any previous error message
      return props.signUserIn(inputs)
        .then(() => navigate('/'))
        .catch(err => {
          setErrorMsg('Invalid email or password');
        });
    },
    debug: false
  };

  const { onSubmit, onChange, inputs, dirty, submitting } = useForm('AdvanceForm', options);

  useEffect(() => {
    return () => {
      setErrorMsg(''); // Cleanup function to reset error message
    };
  }, []);

  return (
    <CenterCard363>
      <div className="text-center">
        <img src={Logo} alt="Company Logo" className="logo" />
      </div>
      <div className='card'>
        <h4 className="card-header">
          Sign In
        </h4>
        <div className="card-body">
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label>Email:</label>
              <input
                name="email"
                type='email'
                value={inputs.email}
                className="form-control form-control-lg"
                placeholder="sample@email.com"
                onChange={onChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input
                type='password'
                name="password"
                value={inputs.password}
                className="form-control form-control-lg"
                placeholder="your password"
                onChange={onChange}
                required
              />
            </div>
            {errMsg && <div className="alert alert-danger">
              <strong>Error!</strong> {errMsg}
            </div>}
            <div style={{ 'paddingTop': '30px' }}>
              <button
                type="submit"
                className="btn btn-lg btn-light btn-block"
                disabled={!dirty || submitting}>
                Sign In
              </button>
            </div>
          </form>
          <div style={{ 'paddingTop': '20px' }}>
            <NavLink to="/signup" className="nav-link">Don't have an account? Sign Up</NavLink>
          </div>
        </div>
      </div>
    </CenterCard363>
  );
};

export default connect(null, { signUserIn })(Signin);
