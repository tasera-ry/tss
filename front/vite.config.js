import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite'
import { lingui } from "@lingui/vite-plugin";

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    plugins: [
      tailwindcss(),
      react({
        babel: {
          plugins: ["@lingui/babel-plugin-lingui-macro"],
        },
      }),
      lingui(),
    ],
    server: {
      proxy: {
        '/api': {
          target: process.env.VITE_PROXY_API ?? 'http://localhost:8000',
          changeOrigin: true,
          ws: true,
          rewriteWsOrigin: true,
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/setupTests.ts',
      // Several component tests legitimately take 3-4s (Scheduling renders a
      // large form and waits on the Lingui catalog), which left almost no
      // headroom under the 5s default once more test files ran in parallel.
      testTimeout: 15000,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  });
};
