import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// El base path coincide con el nombre del repo en GitHub Pages.
// En desarrollo se sobreescribe a '/' automáticamente al usar `vite`.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/terra-diaguitas-maqueta/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));
