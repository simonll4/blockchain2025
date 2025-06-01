<script setup lang="ts">
import { useMetamask } from "@/composables/useMetamask";
import { shorten } from "@/utils/format";
import { useCFPFactory } from "@/composables/CFPFactory/useCFPFactory";
import { watchEffect } from "vue";
import { useIsAdmin } from "@/composables/api/useIsAdmin";

const { isAdmin } = useIsAdmin();
const { account, connect } = useMetamask();
const { init: initFactory } = useCFPFactory();

watchEffect(async () => {
  if (account.value) {
    try {
      await initFactory();
      console.log("Contrato inicializado después de conectar cuenta");
    } catch (err) {
      console.error("Error al inicializar contrato:", err);
    }
  }
});
</script>

<template>
  <v-app class="custom-background">
    <!-- TOPBAR -->
    <v-app-bar color="primary" dark>
      <v-toolbar-title>Call For Proposals</v-toolbar-title>
      <v-spacer />
      <div v-if="account">
        <v-chip color="green" class="ma-2" label>
          {{ shorten(account) }}
        </v-chip>
      </div>
      <div v-else>
        <v-btn color="secondary" @click="connect">Conectar Wallet</v-btn>
      </div>
    </v-app-bar>

    <!-- SIDEBAR con azul a tono -->
    <v-navigation-drawer permanent class="custom-sidebar" width="180">
      <v-list>
        <v-divider class="mb-2" />

        <v-list-item
          to="/"
          prepend-icon="mdi-home"
          title="Inicio"
          value="home"
        />
        <v-list-item
          to="/calls"
          prepend-icon="mdi-file-document-multiple"
          title="Llamados"
          value="calls"
        />
        <v-list-item
          v-if="isAdmin"
          to="/users"
          prepend-icon="mdi-account-cog"
          title="Gestión de Usuarios"
          value="users"
        />
      </v-list>
    </v-navigation-drawer>

    <!-- CONTENIDO PRINCIPAL -->
    <v-main>
      <v-container fluid class="pa-4">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.custom-background {
  background: linear-gradient(135deg, #f4f6f9, #e8edf3); /* Gris frío suave */
  min-height: 100vh;
}

.custom-sidebar {
  background-color: #326bab; /* Azul oscuro que combina con primary */
  color: white;
}
</style>
