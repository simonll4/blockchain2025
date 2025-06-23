<script setup lang="ts">
import { ref } from "vue";

import { useMetamask } from "@/services/metamask/useMetamask";
import { shorten } from "@/utils/format";

const { account, connect } = useMetamask();

const snackbar = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("error");

const handleConnect = async () => {
  try {
    await connect();
  } catch (err: any) {
    snackbarMessage.value = err.message || "Error al conectar con Metamask";
    snackbarColor.value = "error";
    snackbar.value = true;
  }
};
</script>

<template>
  <v-app-bar
    :color="$vuetify.theme.current.dark ? '' : '#294c77'"
    dark
    flat
    app
  >
    <v-spacer />
    <div v-if="account">
      <v-chip color="green" class="ma-2" label>
        {{ shorten(account) }}
      </v-chip>
    </div>
    <div v-else>
      <v-btn color="secondary" @click="handleConnect">Conectar Wallet</v-btn>
    </div>

    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      timeout="3000"
      location="top right"
      variant="tonal"
    >
      {{ snackbarMessage }}
    </v-snackbar>
  </v-app-bar>
</template>
