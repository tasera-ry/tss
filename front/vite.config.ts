import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react'
import path from "path";
import { loadEnv } from 'vite';

export default ({mode}) => {
  process.env = {...process.env, ...loadEnv(mode, process.cwd())};

  return defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: process.env.PROXY_API ?? 'http://localhost:8000',
          changeOrigin: true,
          ws: true,
          rewriteWsOrigin: true,
        }
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/setupTests.js',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
      },
    },
    resolve: {
      alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  })
}
