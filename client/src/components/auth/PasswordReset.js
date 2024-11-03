// client/src/components/auth/ResetPassword.js

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Logo from '../../statics/Logo.png';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      const response = await axios.post('/auth/reset-password', { token, password });
      toast.success('Password reset successfully! Redirecting...');
      setMessage('Password has been reset successfully.');

      setTimeout(() => {
        navigate('/intermediate-page', { state: { message: 'Your password has been changed successfully.' } });
      }, 2000);
    } catch (error) {
      setMessage('Error resetting password. Please try again.');
      toast.error('Error resetting password. Please try again.');
    }
  };

  return (
    <div className="reset-password-container">
      <div className="logo-container">
        <img src={Logo} alt="Logo" className="company-logo" />
      </div>
      <h2>Reset Your Password</h2>
      <form onSubmit={handleSubmit} className="centered-form">
        <div className="form-group">
          <label>New Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-control form-control-lg"
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
          />
        </div>
        <button type="submit" className="btn btn-primary">Reset Password</button>
      </form>
      {message && <p>{message}</p>}
      <ToastContainer />
    </div>
  );
};

export default ResetPassword;