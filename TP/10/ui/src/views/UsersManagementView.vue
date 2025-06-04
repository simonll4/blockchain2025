<script setup lang="ts">
import { onMounted } from "vue";

import { useApiPendingUsers } from "@/composables/api/useApiPendingUsers";
import { useCFPFactoryAuthorize } from "@/composables/contracts/CFPFactory/useCFPFactoryAuthorize";

const { pendingUsers, isLoading, error, fetchPendingUsers } =
  useApiPendingUsers();
const {
  isLoading: authLoading,
  error: authError,
  success: authSuccess,
  message: authMessage,
  authorizeAccount,
} = useCFPFactoryAuthorize();

onMounted(() => {
  fetchPendingUsers();
});

const onAuthorizeClick = async (address: string) => {
  await authorizeAccount(address);
  await fetchPendingUsers();
};
</script>

<template>
  <v-container>
    <v-alert
      type="info"
      variant="tonal"
      class="mb-4"
      v-if="!isLoading && pendingUsers.length"
    >
      A continuación se listan las direcciones que han solicitado registrarse
      pero aún no han sido autorizadas.
    </v-alert>

    <v-progress-linear
      v-if="isLoading"
      indeterminate
      color="primary"
      class="mb-4"
    />

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
      {{ error }}
    </v-alert>

    <v-alert v-if="authError" type="error" variant="tonal" class="mb-4">
      {{ authError }}
    </v-alert>

    <v-alert v-if="authSuccess" type="success" variant="tonal" class="mb-4">
      {{ authMessage }}
    </v-alert>

    <v-list v-if="!isLoading && pendingUsers.length">
      <v-list-item
        v-for="(address, index) in pendingUsers"
        :key="index"
        class="border rounded-lg mb-2"
      >
        <v-row no-gutters align="center" class="w-100">
          <v-col cols="10">
            <div class="font-mono text-truncate px-4 py-2">
              {{ address }}
            </div>
          </v-col>
          <v-col cols="2" class="text-right pr-2">
            <v-btn
              color="primary"
              variant="flat"
              :loading="authLoading"
              :disabled="authLoading"
              @click="() => onAuthorizeClick(address)"
            >
              Autorizar
            </v-btn>
          </v-col>
        </v-row>
      </v-list-item>
    </v-list>

    <v-alert
      v-else-if="!isLoading && !pendingUsers.length"
      type="info"
      variant="tonal"
      class="mt-4"
    >
      No hay usuarios pendientes de autorización en este momento.
    </v-alert>
  </v-container>
</template>
