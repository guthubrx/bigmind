/**
 * ToastContainer - Conteneur pour afficher tous les toasts actifs
 * À placer une fois dans App.tsx
 */

import React from 'react';
import { useToast } from '../../hooks/useToast';
import { Toast } from './Toast';
import './ToastContainer.css';

export function ToastContainer() {
  const toasts = useToast(state => state.toasts);
  const removeToast = useToast(state => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
