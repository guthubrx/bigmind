/**
 * Toast Notification Component
 * Affiche des notifications temporaires en bas à droite de l'écran
 */

import React, { useEffect } from 'react';
import './Toast.css';

export type ToastType = 'success' | 'error' | 'info' | 'loading';

export interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number; // Durée en ms (0 = permanent jusqu'à onClose)
  onClose?: () => void;
}

export function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'info':
        return 'ℹ';
      case 'loading':
        return '⏳';
      default:
        return '';
    }
  };

  return (
    <div className={`toast toast--${type}`} role="alert">
      <span className="toast__icon">{getIcon()}</span>
      <span className="toast__message">{message}</span>
      {onClose && type !== 'loading' && (
        <button type="button" className="toast__close" onClick={onClose} aria-label="Fermer">
          ×
        </button>
      )}
    </div>
  );
}
