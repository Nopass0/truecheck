/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_KEY: string
  readonly VITE_SBP_API_KEY: string
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_AI_ONLY_MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}