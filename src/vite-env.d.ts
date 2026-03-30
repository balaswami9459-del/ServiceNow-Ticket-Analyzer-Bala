/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_ANTHROPIC_API_KEY: string
  readonly VITE_SERVICENOW_INSTANCE_URL: string
  readonly VITE_SERVICENOW_USERNAME: string
  readonly VITE_SERVICENOW_PASSWORD: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
