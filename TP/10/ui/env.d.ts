/// <reference types="vite/client" />


// Declaración para archivos .vue 
declare module "*.vue" {
  import { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}


