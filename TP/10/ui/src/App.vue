<template>
  <v-app>
    <v-navigation-drawer app permanent>
      <v-list>
        <v-list-item-title class="text-h6 my-4 px-4">
          CFP App
        </v-list-item-title>

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

    <v-app-bar app color="primary" dark>
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

    <v-main>
      <v-container fluid class="pa-4">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { useMetamask } from "@/composables/useMetamask";
import { shorten } from "@/utils/format";
let isAdmin = false; // TODO: Replace with actual admin check logic 

const { account, connect } = useMetamask();


</script>

<!-- <template>
  <v-app>

    <v-app-bar app color="primary" dark>
      <v-toolbar-title>Call For Proposals</v-toolbar-title>
      <v-spacer />


      <div v-if="account">
        <v-chip color="green" class="ma-2" label>
          {{ shortenAddress(account) }}
        </v-chip>
      </div>
      <div v-else>
        <v-btn color="secondary" @click="connect">Conectar Wallet</v-btn>
      </div>
    </v-app-bar>

  
    <v-main>
      <v-container class="py-6">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { useMetamask } from "@/composables/useMetamask";

const { account, connect } = useMetamask();

const shortenAddress = (addr: string) =>
  addr.slice(0, 6) + "..." + addr.slice(-4);
</script>

<style scoped>
.v-application {
  font-family: "Roboto", sans-serif;
}
</style> -->
