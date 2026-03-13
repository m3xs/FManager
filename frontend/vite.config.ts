import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@fmanager/common': path.resolve(__dirname, '../common/index.ts'),
      '@fmanager/common/utils': path.resolve(__dirname, '../common/utils/index.ts'),
      '@fmanager/common/types': path.resolve(__dirname, '../common/types/index.ts'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
      '/uploads': 'http://localhost:3001',
    },
  },
});
