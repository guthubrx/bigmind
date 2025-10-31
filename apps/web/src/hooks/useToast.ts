/**
 * Hook useToast - Gestion globale des toasts/notifications
 * Utilise Zustand pour l'état global
 */

import { create } from 'zustand';
import type { ToastType } from '../components/ui/Toast';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  loading: (message: string) => string; // Retourne l'ID pour pouvoir le fermer plus tard
}

export const useToast = create<ToastState>(set => ({
  toasts: [],

  addToast: (message: string, type: ToastType, duration = 3000) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const toast: ToastItem = { id, message, type, duration };

    set(state => ({
      toasts: [...state.toasts, toast],
    }));

    // Auto-remove après duration (sauf si duration = 0)
    if (duration > 0) {
      setTimeout(() => {
        set(state => ({
          toasts: state.toasts.filter(t => t.id !== id),
        }));
      }, duration);
    }
  },

  removeToast: (id: string) => {
    set(state => ({
      toasts: state.toasts.filter(t => t.id !== id),
    }));
  },

  success: (message: string, duration = 3000) => {
    useToast.getState().addToast(message, 'success', duration);
  },

  error: (message: string, duration = 5000) => {
    useToast.getState().addToast(message, 'error', duration);
  },

  info: (message: string, duration = 3000) => {
    useToast.getState().addToast(message, 'info', duration);
  },

  loading: (message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const toast: ToastItem = { id, message, type: 'loading', duration: 0 };
    set(state => ({
      toasts: [...state.toasts, toast],
    }));
    return id;
  },
}));
