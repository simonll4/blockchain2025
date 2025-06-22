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
import { watchEffect } from "vue";

import AppSidebar from "@/components/AppSidebar.vue";
import AppTopbar from "@/components/AppTopbar.vue";
import { useCFPFactory } from "@/services/contracts/useCFPFactory";
import { useMetamask } from "@/services/metamask/useMetamask";

const { init: initFactory } = useCFPFactory();
const { account } = useMetamask();

watchEffect(async () => {
  if (account.value) {
    await initFactory();
  }
});
</script>

<style scoped>
.custom-background {
  background: linear-gradient(135deg, #f4f6f9, #e8edf3);
  min-height: 100vh;
}
</style>
