/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_PROXY_API: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
