// client/src/components/auth/ActivateAccount.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Logo from '../../statics/Logo.png';

const ActivateAccount = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any old tokens or data
    localStorage.removeItem('auth_jwt_token');
    sessionStorage.clear();

    // Ensure the token is present, otherwise redirect or show an error
    if (!token) {
      toast.error('Activation token is missing.');
      setTimeout(() => navigate('/signin'), 3000);
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure passwords match
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      // Call the backend to activate the account
      const response = await axios.post('http://localhost:8000/auth/activate-account', {
        token,
        password,
      });

      // Handle success response
      setMessage('Account activated successfully.');
      toast.success('Account activated successfully! Redirecting to login...');
      
      // Redirect after a delay
      setTimeout(() => {
        navigate('/intermediate-page', { state: { message: 'Your account has been activated successfully.' } });
      }, 2000);
    } catch (error) {
      // Handle activation failure
      console.error('Activation Error:', error.response?.data || error.message);
      setMessage('Error activating account. Please try again.');
      toast.error('Error activating account. Please try again.');
    }
  };

  return (
    <div className="center-container">
      <div className="logo-container">
        <img src={Logo} alt="Logo" className="company-logo" />
      </div>
      <h2 className="form-header">Set Your Password</h2>
      <form onSubmit={handleSubmit} className="centered-form">
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
          <label>Confirm Password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="form-control form-control-lg"
            placeholder="Confirm password"
          />
        </div>
        <button type="submit" className="btn btn-primary btn-lg btn-block">Activate Account</button>
      </form>
      {message && <p>{message}</p>}
      <ToastContainer />
    </div>
  );
};

export default ActivateAccount;