import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { audiobookServerPlugin } from './server/audiobookServer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), audiobookServerPlugin()],
  server: {
    port: 1104,
    strictPort: true,
    host: true,
  },
  preview: {
    port: 1104,
    strictPort: true,
  },
});
