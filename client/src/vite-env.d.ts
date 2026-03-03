/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ACADEMY_SLUG: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
