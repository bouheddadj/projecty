/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_API_URL_USERS: string;
  readonly VITE_API_URL_GAME: string;
  // Ajoutez d'autres variables ici si besoin
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
