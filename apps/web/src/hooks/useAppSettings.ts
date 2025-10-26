import { create } from 'zustand';

type AppSettingsState = {
  accentColor: string;
  setAccentColor: (color: string) => void;
  load: () => void;
};

const STORAGE_KEY = 'bigmind_app_settings';

export const useAppSettings = create<AppSettingsState>((set, get) => ({
  accentColor: '#3b82f6',
  setAccentColor: (color: string) => {
    set({ accentColor: color });
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const obj = raw ? JSON.parse(raw) : {};
      obj.accentColor = color;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
      // Ignore localStorage errors
    }
    // Update CSS variable globally
    try {
      document.documentElement.style.setProperty('--accent-color', color);
    } catch (e) {
      // Ignore localStorage errors
    }
  },
  load: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const obj = JSON.parse(raw);
        if (obj.accentColor) {
          get().setAccentColor(obj.accentColor);
        }
      } else {
        // initialize CSS var with default
        document.documentElement.style.setProperty('--accent-color', get().accentColor);
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  },
}));
