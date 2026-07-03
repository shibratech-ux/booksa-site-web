import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-router';
            }

            if (id.includes('@tanstack/react-query')) {
              return 'react-query';
            }

            if (id.includes('framer-motion')) {
              return 'framer-motion';
            }

            if (id.includes('gsap')) {
              return 'gsap';
            }

            if (id.includes('animejs')) {
              return 'animejs';
            }

            if (id.includes('@amcharts/amcharts5')) {
              return 'amcharts';
            }

            return 'vendor';
          }
        }
      }
    }
  }
});
