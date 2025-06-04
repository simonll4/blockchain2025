<script setup lang="ts">
import { useCFPFactory } from "@/services/contracts/useCFPFactory";
import { useMetamask } from "@/composables/metamask/useMetamask";
import { shorten } from "@/utils/format";
import { ref, watchEffect } from "vue";

const { account, connect } = useMetamask();
const { init: initFactory } = useCFPFactory();

watchEffect(async () => {
  if (account.value) {
    await initFactory();
  }
});

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
