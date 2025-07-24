import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import vuetify from "vite-plugin-vuetify";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // Validar que VITE_API_BASE_URL esté definida
  if (!env.VITE_API_BASE_URL) {
    console.error("❌ VITE_API_BASE_URL is not defined. Please set this environment variable in your .env file.");
    process.exit(1);
  }

  return {
    plugins: [vue(), vueDevTools(), vuetify({ autoImport: true })],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      port: parseInt(env.VITE_PORT) || 5173,
    },
  };
});
