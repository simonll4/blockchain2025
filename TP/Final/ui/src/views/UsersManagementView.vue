<script setup lang="ts">
import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";

import { useApiPendingUsers } from "@/composables/api/useApiPendingUsers";
import { useCFPFactoryAuthorize } from "@/composables/contracts/CFPFactory/useCFPFactoryAuthorize";
import { useENSResolvePendingUsers } from "@/composables/contracts/ens/useENSResolvePendingUsers.ts";

const { pendingUsers, isLoading, error, fetchPendingUsers } =
  useApiPendingUsers();
const {
  isLoading: authLoadingGlobal, // global, pero ya no lo usaremos para el botón individual
  error: authError,
  success: authSuccess,
  message: authMessage,
  authorizeAccount,
} = useCFPFactoryAuthorize();

const { resolvePendingUsers } = useENSResolvePendingUsers();

const loadingUser = ref<string | null>(null); // <-- nuevo: loading individual

onMounted(async () => {
  await fetchPendingUsers();
  await resolvePendingUsers();
});

/**
 * Autoriza el usuario, resolviendo el address si solo tiene name
 */
const onAuthorizeClick = async (user: {
  name: string | null;
  address: string | null;
}) => {
  let addressToAuthorize = user.address;
  const userKey = user.name || user.address || null;

  loadingUser.value = userKey;

  try {
    if (!addressToAuthorize && user.name) {
      await resolvePendingUsers();
      const resolved = pendingUsers.value.find((u) => u.name === user.name);
      console.log("Resolved user:", resolved);
      addressToAuthorize = resolved?.address || null;
    }

    if (!addressToAuthorize) {
      console.error("No se pudo resolver la dirección para autorizar");
      return;
    }

    await authorizeAccount(addressToAuthorize);
    await fetchPendingUsers();
    await resolvePendingUsers();
  } catch (error) {
    console.error("Error autorizando usuario:", error);
  } finally {
    loadingUser.value = null;
  }
};

/**
 * Muestra siempre name si existe, sino address
 */
const displayName = (user: { name: string | null; address: string | null }) =>
  user.name || user.address || "Unknown";
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
        v-for="(user, index) in pendingUsers"
        :key="index"
        class="border rounded-lg mb-2"
      >
        <v-row no-gutters align="center" class="w-100">
          <v-col cols="10">
            <div class="font-mono text-truncate px-4 py-2">
              {{ displayName(user) }}
            </div>
          </v-col>
          <v-col cols="2" class="text-right pr-2">
            <v-btn
              color="primary"
              variant="flat"
              :loading="loadingUser === (user.name || user.address)"
              :disabled="loadingUser === (user.name || user.address)"
              @click="() => onAuthorizeClick(user)"
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
