import React from 'react';
import { createRoot } from 'react-dom/client'; // Use createRoot from react-dom/client
import App from './app';
import './style/style.scss';

const root = createRoot(document.getElementById('root')); // Create the root
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);