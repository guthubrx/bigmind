/**
 * FR: Point d'entrée de l'application web BigMind
 * EN: Entry point for BigMind web application
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// FR: Initialiser l'application React
// EN: Initialize React application
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
