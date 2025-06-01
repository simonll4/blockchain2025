<script setup>
import { ref, onMounted } from "vue";
import { useMetamask } from "@/composables/useMetamask";
import { useIsAuthorized } from "@/composables/CFPFactory/useIsAuthorized";
import { useIsAdmin } from "@/composables/api/useIsAdmin";
import { HealthService } from "@/services/apiClient";
import { useUserStore } from "@/store/user";

import { useRegisterOnChain } from "@/composables/CFPFactory/useRegisterOnChain";
import { useIsRegistered } from "@/composables/CFPFactory/useIsRegistered";

const { register, isLoading, error, success, message } = useRegisterOnChain();

const apiHealthy = ref(false);

const { isAuthorized } = useIsAuthorized();
const { isPending } = useIsRegistered();
const { isAdmin } = useIsAdmin();
const { isConnected, networkOk } = useMetamask();
const userStore = useUserStore();

const onRegisterClick = async () => {
  try {
    await register();
  } catch (err) {
    console.error("Error al registrar:", err);
  }
};

onMounted(async () => {
  try {
    apiHealthy.value = await HealthService.checkApiHealth();
  } catch (err) {
    console.error("Error checking API health:", err);
    apiHealthy.value = false;
  }
});

import { computed } from "vue";
const userStatus = computed(() => {
  if (isAuthorized.value) {
    return { text: "Autorizado", color: "green" };
  }
  if (isPending.value) {
    return { text: "Pendiente de autorización", color: "orange" };
  }
  return { text: "No registrado", color: "red" };
});

const showRegisterButton = computed(() => {
  // Solo mostrar botón si NO está ni pendiente ni autorizado
  return !isAuthorized.value && !isPending.value;
});
</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card class="pa-6" elevation="3">
          <v-card-title class="text-h5 mb-4"> Estado del Usuario </v-card-title>

          <v-list density="compact">
            <v-list-item>
              <v-list-item-title>
                Metamask:
                <v-chip :color="isConnected ? 'green' : 'red'" class="ml-2">
                  {{ isConnected ? "Conectado" : "No conectado" }}
                </v-chip>
              </v-list-item-title>
            </v-list-item>

            <v-list-item>
              <v-list-item-title>
                Red correcta:
                <v-chip :color="networkOk ? 'green' : 'red'" class="ml-2">
                  {{ networkOk ? "Sí" : "No" }}
                </v-chip>
              </v-list-item-title>
            </v-list-item>

            <v-list-item>
              <v-list-item-title>
                Conexión con la API:
                <v-chip :color="apiHealthy ? 'green' : 'red'" class="ml-2">
                  {{ apiHealthy ? "OK" : "Error" }}
                </v-chip>
              </v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>
                Estado del usuario:
                <v-chip :color="userStatus.color" class="ml-2">
                  {{ userStatus.text }}
                </v-chip>
              </v-list-item-title>
            </v-list-item>

            <v-list-item>
              <v-list-item-title>
                ¿Es administrador?:
                <v-chip :color="isAdmin ? 'blue' : 'grey'" class="ml-2">
                  {{ isAdmin ? "Sí" : "No" }}
                </v-chip>
              </v-list-item-title>
            </v-list-item>
          </v-list>

          <v-divider class="my-4" />

          <div v-if="showRegisterButton" class="text-center">
            <v-btn color="primary" @click="onRegisterClick">
              Registrarse para crear CFPs
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
