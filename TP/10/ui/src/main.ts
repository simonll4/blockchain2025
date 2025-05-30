// src/main.ts
import 'vuetify/styles' // ✅ Debe estar primero
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify' // tu configuración custom

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify) // ✅ Asegurate de aplicar Vuetify

app.mount('#app')
