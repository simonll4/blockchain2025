<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

import { useMetamask } from "@/services/metamask/useMetamask";
import { useENSResolveUserAddress } from "@/composables/contracts/ens/useENSResolveUserAddress";

const { account, connect, checkInitialConnection } = useMetamask();
const { ensName, loading } = useENSResolveUserAddress();

const snackbar = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("error");
const checkingConnection = ref(true);

onMounted(async () => {
  checkInitialConnection();
  checkingConnection.value = false;
});

const handleConnect = async () => {
  try {
    await connect();
  } catch (err: any) {
    const errorCode = err?.error?.code || err?.cause?.code;

    if (errorCode === -32002) {
      snackbarMessage.value =
        "Ya hay una ventana de Metamask esperando tu acción. Revisá Metamask.";
    } else {
      snackbarMessage.value = "Conexion a Metamask fallida.";
    }

    snackbarColor.value = "error";
    snackbar.value = true;
  }
};

const displayName = computed(() => ensName.value || account.value);
</script>

<template>
  <v-app-bar
    :color="$vuetify.theme.current.dark ? '' : '#294c77'"
    dark
    flat
    app
  >
    <v-spacer />

    <!-- Esperando verificación de conexión -->
    <div v-if="checkingConnection">
      <v-chip color="grey-darken-2" class="ma-2" label> Cargando... </v-chip>
    </div>

    <!-- Usuario conectado -->
    <div v-else-if="account">
      <v-chip color="green" class="ma-2" label>
        <template v-if="loading"> Cargando ENS... </template>
        <template v-else>
          {{ displayName }}
        </template>
      </v-chip>
    </div>

    <!-- Usuario no conectado -->
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
