<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { format, parseISO } from "date-fns";

import { formatAdressOrName } from "@/utils/format";
import { useUserStore } from "@/store/userStore";

import { useApiCalls } from "@/composables/api/useApiCalls";
import { useApiCreators } from "@/composables/api/useApiCreators";
import { useCFPFactoryIsAuthorized } from "@/composables/contracts/CFPFactory/useCFPFactoryIsAuthorized";
import { useCreateCallWithENS } from "@/composables/contracts/useCreateCallWithENS";

const userStore = useUserStore();
const userAddress = computed(() => userStore.address);
const userENS = computed(() => userStore.ensName);

const { isAuthorized } = useCFPFactoryIsAuthorized();

const { fetchCreators, creators, loading } = useApiCreators();
const { fetchCalls, calls, isLoading, error } = useApiCalls();

const activeTab = ref(0);
const selectedCreators = ref<string[]>([]);

const filteredCalls = computed(() => {
  if (activeTab.value !== 0) return [];
  if (!selectedCreators.value.length) return calls.value;
  return calls.value.filter((call) =>
    selectedCreators.value.includes(call.creator)
  );
});

const myCalls = computed(() => {
  if (activeTab.value !== 1) return [];
  if (!userAddress.value && !userENS.value) return [];
  return calls.value.filter(
    (call) =>
      call.creator.toLowerCase() === userAddress.value?.toLowerCase() ||
      call.creator.toLowerCase() === userENS.value?.toLowerCase()
  );
});

const {
  createCallWithENS,
  isLoading: isCreating,
  error: createError,
  success: createSuccess,
  message: createMessage,
  reset: resetCreateStatus,
} = useCreateCallWithENS();

const showCreateDialog = ref(false);
const newCallName = ref("");
const newCallDescription = ref("");
const newClosingDate = ref("");

const resetCreateForm = () => {
  newCallName.value = "";
  newCallDescription.value = "";
  newClosingDate.value = "";
  showCreateDialog.value = false;
};

const createCall = async () => {
  resetCreateStatus();
  if (!newCallName.value) {
    createError.value = "Debe ingresar un nombre para el llamado.";
    return;
  }
  if (!newCallDescription.value) {
    createError.value = "Debe ingresar una descripción para el llamado.";
    return;
  }
  if (!newClosingDate.value) {
    createError.value = "Debe seleccionar una fecha de cierre.";
    return;
  }

  const closingTimestamp = Math.floor(
    new Date(newClosingDate.value).getTime() / 1000
  );

  try {
    await createCallWithENS(
      newCallName.value,
      newCallDescription.value,
      closingTimestamp
    );
    if (createSuccess.value) {
      resetCreateForm();
    }
  } catch {
    createError.value = "Ocurrió un error al crear el llamado.";
  }
};

const formatDate = (iso?: string) => {
  if (!iso) return "N/A";
  return format(parseISO(iso), "dd/MM/yyyy HH:mm");
};

onMounted(async () => {
  await fetchCreators();
  await fetchCalls();
});
</script>

<template>
  <v-container>
    <!-- BOTÓN crear llamado -->
    <v-row class="mb-4" v-if="isAuthorized">
      <v-col cols="12" class="text-right">
        <v-btn
          color="success"
          @click="showCreateDialog = true"
          :loading="isCreating"
        >
          Crear llamado
        </v-btn>
      </v-col>
    </v-row>

    <!-- Diálogo crear llamado -->
    <v-dialog v-model="showCreateDialog" max-width="600px">
      <v-card>
        <v-card-title>Crear nuevo llamado</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newCallName"
            label="Nombre del llamado (ENS)"
            :disabled="isCreating"
            required
          />
          <v-textarea
            v-model="newCallDescription"
            label="Descripción"
            auto-grow
            :disabled="isCreating"
            required
          />
          <v-text-field
            v-model="newClosingDate"
            label="Fecha y hora de cierre"
            type="datetime-local"
            :disabled="isCreating"
            required
          />

          <v-alert v-if="createError" type="error" dense class="mt-2">
            {{ createError }}
          </v-alert>
          <v-alert v-if="createSuccess" type="success" dense class="mt-2">
            {{ createMessage }}
          </v-alert>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn text @click="showCreateDialog = false" :disabled="isCreating">
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            @click="createCall"
            :loading="isCreating"
            :disabled="isCreating"
          >
            Crear
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Tabs -->
    <v-tabs v-model="activeTab" background-color="primary" dark>
      <v-tab> Llamados activos </v-tab>
      <v-tab v-if="isAuthorized"> Mis llamados </v-tab>
    </v-tabs>

    <!-- TAB 1: Llamados activos -->
    <div v-show="activeTab === 0" class="mt-4">
      <v-row class="mb-4" align="center">
        <v-col cols="12" md="6" lg="4">
          <v-select
            v-model="selectedCreators"
            :items="creators"
            :item-title="formatAdressOrName"
            :item-value="(item) => item"
            label="Filtrar por creador(es)"
            clearable
            multiple
            chips
            :return-object="false"
            :loading="loading"
          />
        </v-col>
      </v-row>

      <v-row justify="center" v-if="isLoading">
        <v-col cols="auto">
          <v-progress-circular indeterminate color="primary" size="50" />
        </v-col>
      </v-row>

      <v-row v-if="error">
        <v-col cols="12">
          <v-alert type="error" border="start" border-color="red">
            Error al cargar los llamados. {{ error }}
            <template #append>
              <v-btn
                variant="text"
                color="red"
                class="ml-2"
                size="small"
                @click="fetchCalls"
              >
                Reintentar
              </v-btn>
            </template>
          </v-alert>
        </v-col>
      </v-row>

      <v-row v-if="!filteredCalls.length && !isLoading && !error">
        <v-col cols="12">
          <v-alert type="info" border="start" border-color="primary">
            No hay llamados para los creadores seleccionados.
          </v-alert>
        </v-col>
      </v-row>

      <v-row dense v-else>
        <v-col
          v-for="call in filteredCalls"
          :key="call.callId"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card
            class="pa-4 d-flex flex-column justify-space-between h-100"
            elevation="4"
          >
            <v-card-title class="text-h6 d-flex align-center">
              <v-icon color="indigo-darken-2" class="me-2"
                >mdi-file-document-outline</v-icon
              >
              {{ formatAdressOrName(call.cfp) }}
            </v-card-title>

            <v-card-text class="pt-0">
              <div class="mb-2">
                <v-icon size="18" class="me-1">mdi-account-circle</v-icon>
                <strong>Creador:</strong>
                <v-chip
                  class="ma-1"
                  color="blue-grey-3"
                  text-color="black"
                  size="small"
                >
                  {{ formatAdressOrName(call.creator) }}
                </v-chip>
              </div>

              <div class="mb-2">
                <v-icon size="18" class="me-1"
                  >mdi-text-box-multiple-outline</v-icon
                >
                <strong>Descripción:</strong>
                <div class="ms-4 text-truncate-break">
                  {{ call.description || "Sin descripción" }}
                </div>
              </div>

              <div class="mt-2">
                <v-icon size="18" class="me-1">mdi-calendar-clock</v-icon>
                <strong>Cierra el:</strong>
                <v-chip
                  class="ma-1"
                  color="green"
                  text-color="white"
                  size="small"
                >
                  {{ formatDate(call.closingTime) }}
                </v-chip>
              </div>
            </v-card-text>

            <v-card-actions class="justify-end mt-2">
              <v-btn
                :to="`/call/${call.callId}`"
                color="primary"
                variant="flat"
                density="comfortable"
              >
                Ver detalle
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- TAB 2: Mis llamados -->
    <div v-show="activeTab === 1" class="mt-4">
      <v-row justify="center" v-if="isLoading">
        <v-col cols="auto">
          <v-progress-circular indeterminate color="primary" size="50" />
        </v-col>
      </v-row>

      <v-row v-if="!myCalls.length && !isLoading">
        <v-col cols="12">
          <v-alert type="info" border="start" border-color="primary">
            No tenés llamados propios.
          </v-alert>
        </v-col>
      </v-row>

      <v-row dense v-else>
        <v-col
          v-for="call in myCalls"
          :key="call.callId"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card
            class="pa-4 d-flex flex-column justify-space-between h-100"
            elevation="4"
          >
            <v-card-title class="text-h6 d-flex align-center">
              <v-icon color="indigo-darken-2" class="me-2"
                >mdi-file-document-outline</v-icon
              >
              {{ formatAdressOrName(call.cfp) }}
            </v-card-title>

            <v-card-text class="pt-0">
              <div class="mb-2">
                <v-icon size="18" class="me-1">mdi-account-circle</v-icon>
                <strong>Creador:</strong>
                <v-chip
                  class="ma-1"
                  color="blue-grey-3"
                  text-color="black"
                  size="small"
                >
                  {{ formatAdressOrName(call.creator) }}
                </v-chip>
              </div>

              <div class="mb-2">
                <v-icon size="18" class="me-1"
                  >mdi-text-box-multiple-outline</v-icon
                >
                <strong>Descripción:</strong>
                <div class="ms-4 text-truncate-break">
                  {{ call.description || "Sin descripción" }}
                </div>
              </div>

              <div class="mt-2">
                <v-icon size="18" class="me-1">mdi-calendar-clock</v-icon>
                <strong>Cierra el:</strong>
                <v-chip
                  class="ma-1"
                  color="green"
                  text-color="white"
                  size="small"
                >
                  {{ formatDate(call.closingTime) }}
                </v-chip>
              </div>
            </v-card-text>

            <v-card-actions class="justify-end mt-2">
              <v-btn
                :to="`/call/${call.callId}`"
                color="primary"
                variant="flat"
                density="comfortable"
              >
                Ver detalle
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<style scoped>
.text-truncate-break {
  word-break: break-word;
  white-space: normal;
}
</style>

<!-- <script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { format, parseISO } from "date-fns";

import { formatCreator } from "@/utils/format";
import { useUserStore } from "@/store/userStore";

import { useApiCalls } from "@/composables/api/useApiCalls";
import { useApiCreators } from "@/composables/api/useApiCreators";
import { useCFPFactoryIsAuthorized } from "@/composables/contracts/CFPFactory/useCFPFactoryIsAuthorized";
import { useCreateCallWithENS } from "@/composables/contracts/useCreateCallWithENS";

const userStore = useUserStore();
const userAddress = computed(() => userStore.address);

const { isAuthorized } = useCFPFactoryIsAuthorized();

const { fetchCreators, creators, loading } = useApiCreators();
const { fetchCalls, calls, isLoading, error } = useApiCalls();

const activeTab = ref(0);
const selectedCreators = ref<string[]>([]);

const filteredCalls = computed(() => {
  if (activeTab.value !== 0) return [];
  if (!selectedCreators.value.length) return calls.value;
  return calls.value.filter((call) =>
    selectedCreators.value.includes(call.creator)
  );
});

const myCalls = computed(() => {
  if (activeTab.value !== 1) return [];
  if (!userAddress.value) return [];
  return calls.value.filter(
    (call) => call.creator.toLowerCase() === userAddress.value.toLowerCase()
  );
});

const {
  createCallWithENS,
  isLoading: isCreating,
  error: createError,
  success: createSuccess,
  message: createMessage,
  reset: resetCreateStatus,
} = useCreateCallWithENS();

const showCreateDialog = ref(false);
const newCallName = ref("");
const newCallDescription = ref("");
const newClosingDate = ref("");

const resetCreateForm = () => {
  newCallName.value = "";
  newCallDescription.value = "";
  newClosingDate.value = "";
  showCreateDialog.value = false;
};

const createCall = async () => {
  resetCreateStatus();
  if (!newCallName.value) {
    createError.value = "Debe ingresar un nombre para el llamado.";
    return;
  }
  if (!newCallDescription.value) {
    createError.value = "Debe ingresar una descripción para el llamado.";
    return;
  }
  if (!newClosingDate.value) {
    createError.value = "Debe seleccionar una fecha de cierre.";
    return;
  }

  const closingTimestamp = Math.floor(
    new Date(newClosingDate.value).getTime() / 1000
  );

  try {
    await createCallWithENS(
      newCallName.value,
      newCallDescription.value,
      closingTimestamp
    );
    if (createSuccess.value) {
      resetCreateForm();
    }
  } catch {
    createError.value = "Ocurrió un error al crear el llamado.";
  }
};

const formatDate = (iso?: string) => {
  if (!iso) return "N/A";
  return format(parseISO(iso), "dd/MM/yyyy HH:mm");
};
</script>

-->
