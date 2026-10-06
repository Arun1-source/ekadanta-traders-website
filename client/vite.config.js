import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// envDir '..' lets the frontend read VITE_* values from the single .env in the project root.
// Only variables starting with VITE_ are ever exposed to the browser; EMAIL_PASSWORD etc. never are.
export default defineConfig({
  plugins: [react()],
  envDir: '..',
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:3000' },
  },
  build: { outDir: 'dist', sourcemap: false },
});
