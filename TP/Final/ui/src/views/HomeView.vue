<script setup>
import { computed, watch, ref } from "vue";
import { useRouter } from "vue-router";

import { useMetamask } from "@/services/metamask/useMetamask";
import { useCFPFactoryIsAuthorized } from "@/composables/contracts/CFPFactory/useCFPFactoryIsAuthorized";
import { useCFPFactoryRegister } from "@/composables/contracts/CFPFactory/useCFPFactoryRegister";
import { useCFPFactoryIsRegistered } from "@/composables/contracts/CFPFactory/useCFPFactoryIsRegistered";
import { useCFPFactoryIsOwner } from "@/composables/contracts/CFPFactory/useCFPFactoryIsOwner";
import { useApiHealthCheck } from "@/composables/api/useApiHealthCheck";
import { useENSResolveUserAddress } from "@/composables/contracts/ens/useENSResolveUserAddress";

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

const { ensName, loading: loadingEnsName } = useENSResolveUserAddress();

const router = useRouter();
const ensDismissed = ref(false);

const showEnsNotice = computed(() => {
  return !ensDismissed.value && (!ensName.value || ensName.value.trim() === "");
});

const goToEnsRegister = () => {
  router.push("/ens-register");
};

const {
  isOwner,
  checkIsOwner,
  loading: loadingIsOwner,
} = useCFPFactoryIsOwner();

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

var isLoading = ref(true);

watch(
  [isConnected, networkOk, account],
  async ([connected, network, currentAccount]) => {
    if (connected && network && currentAccount) {
      await checkIsRegistered();
      await checkIsAuthorized();
      checkIsOwner();
      isLoading.value = false;
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
        <!-- SPINNER: solo visible si está cargando -->
        <div
          v-if="isLoading"
          class="d-flex align-center justify-center"
          style="height: 400px"
        >
          <v-progress-circular indeterminate color="primary" size="48" />
        </div>

        <!-- CONTENIDO PRINCIPAL -->
        <template v-else>
          <v-card class="pa-6" elevation="3">
            <v-card-title class="text-h5 mb-4">Estados</v-card-title>

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
                    <v-chip :color="userStatus.color" class="ml-2">
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

          <template v-if="showEnsNotice">
            <v-alert
              elevation="4"
              color="indigo-darken-3"
              variant="flat"
              class="mt-6 pa-5 rounded-xl"
              closable
              @click:close="ensDismissed = true"
            >
              <div
                class="d-flex flex-column flex-sm-row align-center justify-space-between"
              >
                <div
                  class="text-white text-body-1 font-weight-medium d-flex align-center"
                >
                  <v-icon
                    icon="mdi-alert-circle-outline"
                    class="mr-2"
                    color="white"
                  />
                  No tenés un nombre ENS asociado a tu cuenta.
                  <br class="d-sm-none" />
                  &nbsp;Podés registrarlo haciendo clic en el botón.
                </div>
                <v-btn
                  class="mt-4 mt-sm-0 ml-sm-6"
                  color="blue"
                  variant="elevated"
                  size="large"
                  rounded="xl"
                  prepend-icon="mdi-domain-plus"
                  @click="goToEnsRegister"
                >
                  Registrar ENS
                </v-btn>
              </div>
            </v-alert>
          </template>
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>

<!-- <template>
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

        <template v-if="showEnsNotice">
          <v-alert
            elevation="4"
            color="indigo-darken-3"
            variant="flat"
            class="mt-6 pa-5 rounded-xl"
            closable
            @click:close="ensDismissed = true"
          >
            <div
              class="d-flex flex-column flex-sm-row align-center justify-space-between"
            >
              <div
                class="text-white text-body-1 font-weight-medium d-flex align-center"
              >
                <v-icon
                  icon="mdi-alert-circle-outline"
                  class="mr-2"
                  color="white"
                />
                No tenés un nombre ENS asociado a tu cuenta.
                <br class="d-sm-none" />
                &nbsp;Podés registrarlo haciendo clic en el botón.
              </div>
              <v-btn
                class="mt-4 mt-sm-0 ml-sm-6"
                color="blue"
                variant="elevated"
                size="large"
                rounded="xl"
                prepend-icon="mdi-domain-plus"
                @click="goToEnsRegister"
              >
                Registrar ENS
              </v-btn>
            </div>
          </v-alert>
        </template>
      </v-col>
    </v-row>
  </v-container>
</template> -->
