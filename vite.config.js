import { defineConfig } from 'vite'
import preact from '@preact/preset-vite';
import { resolve as pathResolve } from 'path';
import basicSsl from '@vitejs/plugin-basic-ssl';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    preact(),
    basicSsl(),
  ],
  resolve: {
    alias: {
      '@': pathResolve(__dirname, './src'),
    },
  },
})
