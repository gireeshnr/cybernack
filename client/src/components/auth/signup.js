import React, { useState } from 'react';
import { connect } from 'react-redux';
import { signUserUp } from '../../auth/actions';
import CenterCard from '../CenterCard'; // Use the new consolidated CenterCard component
import useForm from '../../use-form-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { ThreeDots } from 'react-loader-spinner'; // Import the specific loader

const Signup = (props) => {
  const [errMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  const options = {
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      org: ''
    },
    callback: (inputs, e) => {
      if (e) e.preventDefault(); // Ensure the event is passed correctly to prevent default form behavior

      setLoading(true); // Start loading
      props.signUserUp({ ...inputs })
        .then(() => {
          setLoading(false); // Stop loading

          // Show success toast with an OK button
          toast.success(
            <div>
              <p>You signed up successfully! Please check your email to activate your account.</p>
              <button
                onClick={() => {
                  toast.dismiss(); // Close the toast
                  navigate('/signin'); // Redirect to sign-in page
                }}
                className="btn btn-primary"
              >
                OK
              </button>
            </div>, {
            position: 'top-center',
            autoClose: false, // Keep open until user clicks OK
            closeOnClick: false,
            draggable: false,
            hideProgressBar: true, // Hide the progress bar
          });
        })
        .catch(err => {
          setLoading(false); // Stop loading
          setErrorMsg(err.response?.data || 'Error signing up. Please try again.');
        });
    },
    debug: false
  };

  const { onSubmit, onChange, inputs, dirty, submitting } = useForm('SignupForm', options);

  return (
    <CenterCard showLogo={true}> {/* Use CenterCard with the logo for signup */}
      <h2 className="form-header">Sign Up</h2>
      <div className="centered-form">
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>First Name:</label>
            <input
              name="firstName"
              value={inputs.firstName}
              type="text"
              onChange={onChange}
              className="form-control form-control-lg"
              placeholder="First Name"
              required />
          </div>
          <div className="form-group">
            <label>Last Name:</label>
            <input
              name="lastName"
              value={inputs.lastName}
              type="text"
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
              type="email"
              onChange={onChange}
              className="form-control form-control-lg"
              placeholder="sample@email.com"
              required />
          </div>
          <div className="form-group">
            <label>Organization:</label>
            <input
              name="org"
              value={inputs.org}
              type="text"
              onChange={onChange}
              className="form-control form-control-lg"
              placeholder="Organization"
              required
            />
          </div>
          {errMsg && <div className="alert alert-warning">
            <strong>Oops!</strong> {errMsg}
          </div>}
          <div style={{ paddingTop: '30px' }}>
            <button
              type="submit"
              className="btn btn-primary btn-lg btn-block"
              disabled={!dirty || submitting || loading}> {/* Disable button when loading */}
              {loading ? (
                <ThreeDots // Use the specific loader component
                  height={20}
                  width={30}
                  color="#fff"
                />
              ) : 'Sign Up'}
            </button>
          </div>
        </form>
        <ToastContainer /> {/* Toast container for notifications */}
      </div>
    </CenterCard>
  );
}

export default connect(null, { signUserUp })(Signup);