<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

import { useMetamask } from "@/services/metamask/useMetamask";

import { useENSRegisterUser } from "@/composables/contracts/ens/useENSRegisterUser";
import { useENSResolveAddress } from "@/composables/contracts/ens/useENSResolveAddress";

const username = ref("");
const isLoading = ref(false);
const error = ref<string | null>(null);
const success = ref(false);

const { account } = useMetamask();

const userAddress = computed(() => account.value || "");
const resolvedName = ref<string | null>(null);

const { registerUserName } = useENSRegisterUser();
const { resolveAddress } = useENSResolveAddress();

const fetchENSName = async () => {
  if (!userAddress.value) return;
  try {
    const name = await resolveAddress(userAddress.value);
    resolvedName.value = name;
  } catch {
    resolvedName.value = null;
  }
};

const onRegister = async () => {
  error.value = null;
  success.value = false;
  if (!username.value) return;

  isLoading.value = true;
  try {
    await registerUserName(username.value);
    success.value = true;
    await fetchENSName();
  } catch (e: any) {
    console.error("Error al registrar el nombre ENS:", e);
    error.value = e.message || "Error al registrar el nombre";
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchENSName();
});
</script>

<template>
  <v-container
    class="fill-height d-flex flex-column justify-center align-center"
  >
    <v-card class="pa-6" max-width="420" elevation="8">
      <v-card-title class="text-h5 font-weight-bold mb-2">
        Registrar tu nombre ENS
      </v-card-title>
      <v-card-subtitle class="mb-4">
        Asocia un nombre de usuario a tu dirección de Ethereum
      </v-card-subtitle>

      <v-form @submit.prevent="onRegister" v-if="!success">
        <v-text-field
          v-model="username"
          label="Nombre de usuario"
          prepend-inner-icon="mdi-account"
          :disabled="isLoading"
          :rules="[(v) => !!v || 'El nombre es requerido']"
          required
        />
        <v-btn
          :loading="isLoading"
          color="primary"
          class="mt-4"
          type="submit"
          block
        >
          Registrar
        </v-btn>

        <v-alert
          v-if="error"
          type="error"
          class="mt-3"
          border="start"
          variant="tonal"
        >
          {{ error }}
        </v-alert>
      </v-form>

      <v-alert
        v-if="success"
        type="success"
        class="mt-3"
        border="start"
        variant="tonal"
      >
        ¡Registro exitoso! Tu nombre ENS ha sido registrado.
      </v-alert>

      <v-divider class="my-6" />

      <div class="text-center">
        <div class="mb-2 text-caption">Resolución actual:</div>
        <v-chip
          v-if="resolvedName"
          color="primary"
          class="mb-2"
          prepend-icon="mdi-account"
        >
          {{ resolvedName }}
        </v-chip>
        <v-chip v-else color="grey" class="mb-2" prepend-icon="mdi-wallet">
          {{ userAddress }}
        </v-chip>
      </div>
    </v-card>
  </v-container>
</template>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>
