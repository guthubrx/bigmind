/**
 * FR: Point d'entrée de l'application web BigMind
 * EN: Entry point for BigMind web application
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { SlotFillProvider } from './core/ui';
import { ThemeProvider } from './core/theme';

// FR: Filtrer les logs HMR de Vite dans la console du navigateur
// EN: Filter Vite HMR logs in browser console
if (import.meta.env.DEV) {
  const originalLog = console.log;
  console.log = (...args: any[]) => {
    // Filtrer les messages [vite] et [hmr]
    if (
      args.length > 0 &&
      typeof args[0] === 'string' &&
      (args[0].includes('[vite]') || args[0].includes('[hmr]'))
    ) {
      return; // Ne pas afficher
    }
    originalLog.apply(console, args);
  };
}

// FR: Initialiser l'application React
// EN: Initialize React application
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <SlotFillProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SlotFillProvider>
    </ThemeProvider>
  </React.StrictMode>
);
