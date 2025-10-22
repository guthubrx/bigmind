/* eslint-disable */
/**
 * FR: Configuration Vite pour l'application web BigMind
 * EN: Vite configuration for BigMind web application
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(), // FR: Support des paths TypeScript / EN: TypeScript paths support
  ],
  resolve: {
    alias: {
      '@bigmind/core': path.resolve(__dirname, '../../packages/core/dist/index.js'),
      '@bigmind/ui': path.resolve(__dirname, '../../packages/ui/src/index.ts'),
      '@bigmind/design': path.resolve(__dirname, '../../packages/design/src/index.ts'),
    },
  },
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
});
