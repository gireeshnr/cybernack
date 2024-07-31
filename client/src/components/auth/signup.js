import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { signUserUp } from '../../actions';
import CenterCard363 from '../centerCard363';
import useForm from '../../use-form-react';

const Signup = (props) => {
  const [errMsg, setErrorMsg] = useState('');
  const [rootDomain, setRootDomain] = useState(''); // State for root domain

  const options = {
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      password2: '',
      org: '' // Add organization field if necessary
    },
    callback: () => {
      if (inputs.password === inputs.password2) {
        props.signUserUp({ ...inputs, rootDomain }) // Include rootDomain in the signup data
          .catch(err => {
            setErrorMsg(err.response.data || 'Error signing up. Please try again.');
          });
      } else {
        setErrorMsg('Passwords do not match');
      }
    },
    debug: false
  };

  const { onSubmit, onChange, inputs, dirty, submitting } = useForm('AdvanceForm', options);

  useEffect(() => {
    const emailParts = inputs.email.split('@');
    if (emailParts.length > 1) {
      setRootDomain(emailParts[1]);
    } else {
      setRootDomain('');
    }
  }, [inputs.email]);

  return (
    <CenterCard363>
      <div className='card'>
        <h4 className="card-header">
          Sign Up
        </h4>
        <div className="card-body">
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label>First name:</label>
              <input
                name="firstName"
                value={inputs.firstName}
                type='text'
                onChange={onChange}
                className="form-control form-control-lg"
                placeholder="First Name"
                required />
            </div>
            <div className="form-group">
              <label>Last name:</label>
              <input
                name="lastName"
                value={inputs.lastName}
                type='text'
                onChange={onChange}
                className="form-control form-control-lg"
                placeholder="Last Name"
                required />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                name="email"
                value={inputs.email}
                type='email'
                onChange={onChange}
                className="form-control form-control-lg"
                placeholder="sample@email.com"
                required />
            </div>
            <div className="form-group">
              <label>Root Domain:</label>
              <input
                name="rootDomain"
                value={rootDomain}
                type='text'
                className="form-control form-control-lg"
                readOnly
              />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input
                type='password'
                name="password"
                value={inputs.password}
                onChange={onChange}
                className="form-control form-control-lg"
                placeholder="your password"
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm Password:</label>
              <input
                type='password'
                name="password2"
                value={inputs.password2}
                onChange={onChange}
                className="form-control form-control-lg"
                placeholder="your password again"
                required />
            </div>
            <div className="form-group">
              <label>Organization:</label>
              <input
                name="org"
                value={inputs.org}
                type='text'
                onChange={onChange}
                className="form-control form-control-lg"
                placeholder="Organization"
                required
              />
            </div>
            {errMsg && <div className="alert alert-warning">
              <strong>Oops!</strong> {errMsg}
            </div>}
            <div style={{ 'paddingTop': '30px' }}>
              <button
                type="submit"
                className="btn btn-lg btn-light btn-block"
                disabled={!dirty || submitting}>
                Sign Up
              </button>
            </div>
          </form>
        </div>
      </div>
    </CenterCard363>
  );
}

export default connect(null, { signUserUp })(Signup);
