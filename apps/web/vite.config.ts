/* eslint-disable */
/**
 * FR: Configuration Vite pour l'application web BigMind
 * EN: Vite configuration for BigMind web application
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(), // FR: Support des paths TypeScript / EN: TypeScript paths support
  ],
  server: {
    port: 5173,
    open: false, // FR: Ouvrir automatiquement le navigateur / EN: Auto-open browser
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // FR: Séparer les chunks pour optimiser le chargement
          // EN: Separate chunks to optimize loading
          vendor: ['react', 'react-dom'],
          ui: ['@xyflow/react', 'zustand'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@xyflow/react'],
  },
  test: {
    // FR: Configuration Vitest
    // EN: Vitest configuration
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
  },
});
