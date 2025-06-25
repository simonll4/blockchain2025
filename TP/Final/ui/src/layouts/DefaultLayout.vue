<template>
  <v-app class="custom-background">
    <AppSidebar />
    <AppTopbar />

    <v-main>
      <v-container fluid class="pa-4">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { onMounted, watchEffect } from "vue";

import AppSidebar from "@/components/AppSidebar.vue";
import AppTopbar from "@/components/AppTopbar.vue";
import { useCFPFactory } from "@/services/contracts/business/useCFPFactory";
import { useMetamask } from "@/services/metamask/useMetamask";

import { useUsuariosRegistrar } from "@/services/contracts/ens/useUsuariosRegistrar";
import { useReverseRegistrar } from "@/services/contracts/ens/useReverseRegistrar";
import { usePublicResolver } from "@/services/contracts/ens/usePublicResolver";
import { useENSRegistry } from "@/services/contracts/ens/useENSRegistry";

const { account, checkInitialConnection } = useMetamask();

const { init: initUsuariosRegistrar } = useUsuariosRegistrar();
const { init: initReverseRegistrar } = useReverseRegistrar();
const { init: initPublicResolver } = usePublicResolver();
const { init: initENSRegistry } = useENSRegistry();
const { init: initFactory } = useCFPFactory();

watchEffect(async () => {
  if (account.value) {
    // Initialize all contracts when the account is connected
    initFactory();
    initUsuariosRegistrar();
    initReverseRegistrar();
    initPublicResolver();
    initENSRegistry();
  }
});

onMounted(() => {
  checkInitialConnection();
});
</script>

<style scoped>
.custom-background {
  background: linear-gradient(135deg, #f4f6f9, #e8edf3);
  min-height: 100vh;
}
</style>
