<script setup>
import { computed, watch } from "vue";

import { useMetamask } from "@/composables/useMetamask";
import { useCFPFactoryIsAuthorized } from "@/composables/CFPFactory/useCFPFactoryIsAuthorized";
import { useApiOwner } from "@/composables/api/useApiOwner";
import { useCFPFactoryRegister } from "@/composables/CFPFactory/useCFPFactoryRegister";
import { useCFPFactoryIsRegistered } from "@/composables/CFPFactory/useCFPFactoryIsRegistered";
import { useApiHealthCheck } from "@/composables/api/useApiHealthCheck";

const { isConnected, networkOk } = useMetamask();

const { register } = useCFPFactoryRegister();

const {
  isAuthorized,
  checkIsAuthorized,
  loading: loadingIsAuthorized,
} = useCFPFactoryIsAuthorized();

const {
  isPending,
  checkIsRegistered,
  loading: loadingIsRegistered,
} = useCFPFactoryIsRegistered();

const { isOwner, checkIsOwner } = useApiOwner();

const { isHealthy } = useApiHealthCheck();

const userStatus = computed(() => {
  const statuses = {
    authorized: { text: "Autorizado", color: "green" },
    pending: { text: "Pendiente de autorización", color: "orange" },
    none: { text: "No registrado", color: "red" },
  };

  if (isAuthorized.value) return statuses.authorized;
  if (isPending.value) return statuses.pending;
  return statuses.none;
});

// Solo mostrar botón si NO está ni pendiente ni autorizado
const showRegisterButton = computed(() => {
  return !isAuthorized.value && !isPending.value;
});

// Función para manejar el clic en el botón de registro
const onRegisterClick = async () => {
  await register();
  checkIsRegistered();
};

watch(
  [isConnected, networkOk],
  ([connected, network]) => {
    if (connected && network) {
      checkIsAuthorized();
      checkIsRegistered();
      checkIsOwner();
    } else {
      isAuthorized.value = false;
      isPending.value = false;
      isOwner.value = false;
    }
  },
  { immediate: true }
);
</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card class="pa-6" elevation="3">
          <v-card-title class="text-h5 mb-4"> Estados </v-card-title>

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
                <v-chip :color="isHealthy ? 'green' : 'red'" class="ml-2">
                  {{ isHealthy ? "OK" : "Error" }}
                </v-chip>
              </v-list-item-title>
            </v-list-item>

            <!-- <v-list-item>
              <v-list-item-title>
                Estado del usuario:
                <v-chip :color="userStatus.color" class="ml-2">
                  {{ userStatus.text }}
                </v-chip>
              </v-list-item-title>
            </v-list-item> -->

            <v-list-item>
              <v-list-item-title>
                Estado del usuario:
                <v-chip
                  v-if="loadingIsAuthorized || loadingIsRegistered"
                  class="ml-2"
                  color="grey"
                  text-color="white"
                >
                  <v-progress-circular
                    indeterminate
                    color="white"
                    size="16"
                    width="2"
                  />
                  <span class="ml-2">Verificando...</span>
                </v-chip>

                <v-chip v-else :color="userStatus.color" class="ml-2">
                  {{ userStatus.text }}
                </v-chip>
              </v-list-item-title>
            </v-list-item>

            <v-list-item>
              <v-list-item-title>
                ¿Es administrador?:
                <v-chip :color="isOwner ? 'blue' : 'grey'" class="ml-2">
                  {{ isOwner ? "Sí" : "No" }}
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
