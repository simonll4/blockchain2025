<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useMetamask } from "@/services/metamask/useMetamask";
import { useENSResolveUserAddress } from "@/composables/contracts/ens/useENSResolveUserAddress";
import { shorten } from "@/utils/format";

const { account, connect, checkInitialConnection } = useMetamask();
const { ensName, loading } = useENSResolveUserAddress();

const snackbar = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("error");

const checkingConnection = ref(true); // Nueva bandera

onMounted(async () => {
  await checkInitialConnection();
  checkingConnection.value = false;
});

const handleConnect = async () => {
  try {
    await connect();
  } catch (err: any) {
    snackbarMessage.value = err.message || "Error al conectar con Metamask";
    snackbarColor.value = "error";
    snackbar.value = true;
  }
};

// const displayName = computed(
//   () => ensName.value || (account.value ? shorten(account.value) : "")
// );
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

<!-- <script setup lang="ts">
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";

import { useMetamask } from "@/services/metamask/useMetamask";
import { useUserStore } from "@/store/userStore";
import { shorten } from "@/utils/format";
import { useENSResolveAddress } from "@/composables/contracts/ens/useENSResolveAddress";

const { account, connect } = useMetamask();
const userStore = useUserStore();
//const { ensName } = storeToRefs(userStore);
const { ensName, loading } = useENSResolveAddress();

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

// Mostrar ENS si existe, si no, dirección abreviada
const displayName = computed(() => {
  return ensName.value || (account.value ? shorten(account.value) : "");
});
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
        {{ displayName }}
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
</template> -->

<!-- <script setup lang="ts">
import { onMounted, ref } from "vue";

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
</template> -->
