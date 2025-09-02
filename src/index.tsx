import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { developmentLogger, sendToGoogleAnalytics, initializeAnalytics } from './utils/analytics';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Initialize analytics
initializeAnalytics();

// Enhanced Web Vitals reporting
// In development: detailed console logging
// In production: send to Google Analytics
if (process.env.NODE_ENV === 'development') {
  reportWebVitals(developmentLogger);
} else {
  reportWebVitals(sendToGoogleAnalytics);
}
