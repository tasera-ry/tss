import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://tss2.tasera.fi',
        // target: 'http://localhost:8000',
        changeOrigin: true,
        ws: true,
        rewriteWsOrigin: true,
      }
    },
  },
  resolve: {
    alias: {
    "@": path.resolve(__dirname, "./src"),
  },
},
})
