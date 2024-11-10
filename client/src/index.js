import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import './style/style.scss';

// Log to ensure correct environment variable is loaded
console.log('REACT_APP_API_BASE_URL in index.js:', process.env.REACT_APP_API_BASE_URL);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);