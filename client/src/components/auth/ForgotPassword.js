import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Logo from '../../statics/Logo.png';
import { useNavigate } from 'react-router-dom';

toast.configure();

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const apiUrl = process.env.REACT_APP_API_BASE_URL || 'https://app.cybernack.com';
      await axios.post(`${apiUrl}/auth/forgot-password`, { email });
      setIsSubmitted(true);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        toast.error('The provided email is not known to us.');
      } else {
        toast.error('Error sending reset email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="center-container">
        <div className="logo-container">
          <img src={Logo} alt="Logo" className="company-logo" />
        </div>
        <div className="intermediate-page">
          <h2>If the email provided is registered with us, you will receive a password reset email.</h2>
          <button className="btn btn-primary" onClick={() => navigate('/signin')}>
            Click to log in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="center-container">
      <div className="logo-container">
        <img src={Logo} alt="Logo" className="company-logo" />
      </div>
      <h2 className="form-header">Forgot Password</h2>
      <div className="centered-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-control form-control-lg"
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-lg btn-block"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Email'}
          </button>
        </form>
        {isLoading && <p>Sending reset email, please wait...</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;