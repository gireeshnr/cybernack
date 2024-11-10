import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api'; // Use configured axios instance
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Logo from '../../statics/Logo.png';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isReset, setIsReset] = useState(false);
  const [errorMsg, setErrorMsg] = useState(''); // State for user-friendly error message
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    try {
      console.log('API URL for reset password:', axios.defaults.baseURL + '/auth/reset-password');
      await axios.post('/auth/reset-password', { token, password });
      setIsReset(true);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErrorMsg('The reset link is invalid or has expired. Please request a new reset link.');
      } else {
        toast.error('Error resetting password. Please try again.');
      }
    }
  };

  if (isReset) {
    return (
      <div className="center-container">
        <div className="logo-container">
          <img src={Logo} alt="Company Logo" className="company-logo" />
        </div>
        <div className="intermediate-page">
          <h2>Password Reset Successfully!</h2>
          <p>Your password has been changed. Click below to log in.</p>
          <button className="btn btn-primary" onClick={() => navigate('/signin')}>
            Click here to log in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="center-container">
      <div className="logo-container">
        <img src={Logo} alt="Company Logo" className="company-logo" />
      </div>
      <h2 className="form-header">Reset Password</h2>
      <div className="centered-form">
        {errorMsg && <div className="alert alert-danger"><strong>Error!</strong> {errorMsg}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-control form-control-lg"
              placeholder="Enter new password"
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="form-control form-control-lg"
              placeholder="Confirm new password"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg btn-block">Reset Password</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;