/// <reference types="vite/client" />


// Tipado para variables de entorno
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_PORT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Usa import.meta.env para leer las variables:

// ts
// // En un componente Vue o archivo .ts
// const apiUrl = import.meta.env.VITE_API_BASE_URL
// const port = import.meta.env.VITE_PORT

// console.log("API base URL:", apiUrl) // http://localhost:3000/api

// Declaración para archivos .vue 
declare module "*.vue" {
  import { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}


