import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      'utils': path.resolve(__dirname, './src/utils'),
      'types': path.resolve(__dirname, './src/components/types.ts')
    }
  }
})