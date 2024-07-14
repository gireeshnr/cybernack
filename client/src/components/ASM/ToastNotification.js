import React from 'react';
import { Toast } from 'react-bootstrap';
import './ToastNotification.css';

const ToastNotification = ({ showToast, setShowToast, message, error }) => {
  return (
    <Toast
      onClose={() => setShowToast(false)}
      show={showToast}
      delay={4000}
      autohide
      className={`toast-notification ${error ? 'error-toast' : 'success-toast'}`}
    >
      <Toast.Body className="toast-body-text">{message || error}</Toast.Body>
    </Toast>
  );
};

export default ToastNotification;
