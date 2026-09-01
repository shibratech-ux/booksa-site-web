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

            if (id.includes('/firebase/') || id.includes('/@firebase/')) {
              return 'firebase';
            }

            if (
              id.includes('/lucide-react/') ||
              id.includes('/react-icons/') ||
              id.includes('/@heroicons/') ||
              id.includes('/@fluentui/react-icons/')
            ) {
              return 'icons';
            }

            if (
              id.includes('/react-hook-form/') ||
              id.includes('/@hookform/resolvers/') ||
              id.includes('/zod/')
            ) {
              return 'forms';
            }

            if (id.includes('/recharts/')) {
              return 'charts';
            }

            if (id.includes('/i18next')) {
              return 'i18n';
            }

            return 'vendor';
          }
        }
      }
    }
  }
});
