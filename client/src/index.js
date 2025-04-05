// client/src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';
import './style/style.scss';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);