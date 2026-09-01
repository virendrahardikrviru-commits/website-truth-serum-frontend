import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import ReactGA from 'react-ga4';
import App from './App.jsx';
import './index.css';

// --- Google Analytics 4 Initialization ---
const GA_MEASUREMENT_ID = 'G-3F1ET5BY98';
ReactGA.initialize(GA_MEASUREMENT_ID);
// --- End GA4 Initialization ---

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);