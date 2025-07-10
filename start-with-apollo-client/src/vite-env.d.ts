/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly GRAPHQL_ENDPOINT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}