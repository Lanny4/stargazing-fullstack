import { defineConfig } from 'vite';

export default defineConfig({
  root: 'client',
  plugins: [],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:4000', '/openapi.yaml': 'http://localhost:4000' }
  },
  build: { outDir: 'dist', emptyOutDir: true }
});
