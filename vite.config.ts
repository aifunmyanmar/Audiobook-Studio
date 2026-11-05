import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { audiobookServerPlugin } from './server/audiobookServer';
import path from 'path';
import fs from 'fs';

function copySelectivePublicPlugin(): Plugin {
  return {
    name: 'copy-selective-public',
    closeBundle() {
      const publicDir = path.resolve(__dirname, 'public');
      const distDir = path.resolve(__dirname, 'dist');
      if (!fs.existsSync(distDir)) return;
      ['fonts', 'backgrounds'].forEach((sub) => {
        const src = path.join(publicDir, sub);
        const dest = path.join(distDir, sub);
        if (fs.existsSync(src)) {
          fs.cpSync(src, dest, { recursive: true });
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), audiobookServerPlugin(), copySelectivePublicPlugin()],
  server: {
    port: 1104,
    strictPort: true,
    host: true,
  },
  preview: {
    port: 1104,
    strictPort: true,
  },
  build: {
    // Avoid copying multi-gigabyte exported user videos from public/downloads into dist
    copyPublicDir: false,
  },
});
