<script setup>
import { computed, watch } from "vue";

import { useMetamask } from "@/services/metamask/useMetamask";
import { useCFPFactoryIsAuthorized } from "@/composables/contracts/CFPFactory/useCFPFactoryIsAuthorized";
import { useCFPFactoryRegister } from "@/composables/contracts/CFPFactory/useCFPFactoryRegister";
import { useCFPFactoryIsRegistered } from "@/composables/contracts/CFPFactory/useCFPFactoryIsRegistered";
import { useCFPFactoryIsOwner } from "@/composables/contracts/CFPFactory/useCFPFactoryIsOwner";
import { useApiHealthCheck } from "@/composables/api/useApiHealthCheck";


const { isConnected, networkOk, account } = useMetamask();

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

// TODO traer el estado de isOwner desde el contrato
const { isOwner, checkIsOwner } = useCFPFactoryIsOwner();

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

const showRegisterButton = computed(() => {
  return !isAuthorized.value && !isPending.value && networkOk.value;
});

// Función para manejar el click en el botón de registro
const onRegisterClick = async () => {
  await register();
  checkIsRegistered();
};

watch(
  [isConnected, networkOk, account],
  ([connected, network, currentAccount]) => {
    if (connected && network && currentAccount) {
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

            <div v-if="isConnected">
              <v-list-item>
                <v-list-item-title>
                  Red correcta:
                  <v-chip :color="networkOk ? 'green' : 'red'" class="ml-2">
                    {{ networkOk ? "Sí" : "No" }}
                  </v-chip>
                </v-list-item-title>
              </v-list-item>
            </div>

            <v-list-item>
              <v-list-item-title>
                Conexión con la API:
                <v-chip :color="isHealthy ? 'green' : 'red'" class="ml-2">
                  {{ isHealthy ? "OK" : "Error" }}
                </v-chip>
              </v-list-item-title>
            </v-list-item>

            <div v-if="isConnected && networkOk">
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
            </div>
            <div v-if="isConnected && networkOk">
              <v-list-item>
                <v-list-item-title>
                  ¿Es administrador?:
                  <v-chip :color="isOwner ? 'blue' : 'grey'" class="ml-2">
                    {{ isOwner ? "Sí" : "No" }}
                  </v-chip>
                </v-list-item-title>
              </v-list-item>
            </div>
          </v-list>

          <v-divider class="my-4" />

          <div v-if="showRegisterButton" class="text-center">
            <v-btn
              color="primary"
              @click="onRegisterClick"
              style="text-transform: none"
            >
              REGISTRARME PARA CREAR CFPs
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
