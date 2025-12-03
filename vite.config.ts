import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Results-v.2/', // IMPORTANT: This must match your GitHub Repository name
  build: {
    outDir: 'dist',
  },
});