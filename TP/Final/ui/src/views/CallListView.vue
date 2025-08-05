<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { format, parseISO } from "date-fns";

import { formatAdressOrName } from "@/utils/format";
import { useUserStore } from "@/store/userStore";

import { useApiCalls } from "@/composables/api/useApiCalls";
import { useApiCreators } from "@/composables/api/useApiCreators";
import { useCFPFactoryIsAuthorized } from "@/composables/contracts/business/CFPFactory/useCFPFactoryIsAuthorized";
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
  let filtered = calls.value;
  if (selectedCreators.value.length) {
    filtered = calls.value.filter((call) =>
      selectedCreators.value.includes(call.creator)
    );
  }
  // Invertir el orden de los llamados
  return filtered.slice().reverse();
});

const myCalls = computed(() => {
  if (activeTab.value !== 1) return [];
  if (!userAddress.value && !userENS.value) return [];
  const filtered = calls.value.filter(
    (call) =>
      call.creator.toLowerCase() === userAddress.value?.toLowerCase() ||
      call.creator.toLowerCase() === userENS.value?.toLowerCase()
  );
  // Invertir el orden de los llamados
  return filtered.slice().reverse();
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

const openCreateDialog = () => {
  resetCreateStatus();
  showCreateDialog.value = true;
};

// Validar si el formulario es válido
const isFormValid = computed(() => {
  const nameValid =
    newCallName.value.trim() && /^[a-zA-Z0-9-]+$/.test(newCallName.value);
  const descriptionValid = newCallDescription.value.trim();
  const dateValid =
    newClosingDate.value && new Date(newClosingDate.value) > new Date();

  return nameValid && descriptionValid && dateValid;
});

const createCall = async () => {
  resetCreateStatus();

  const closingDate = new Date(newClosingDate.value);
  const closingTimestamp = Math.floor(closingDate.getTime() / 1000);

  try {
    await createCallWithENS(
      newCallName.value,
      newCallDescription.value,
      closingTimestamp
    );
    if (createSuccess.value) {
      // Cerrar el modal primero para ocultar la información
      showCreateDialog.value = false;
      // Luego resetear el formulario después de que se cierre
      setTimeout(() => {
        newCallName.value = "";
        newCallDescription.value = "";
        newClosingDate.value = "";
      }, 1000);
    }
  } catch {
    createError.value = "Ocurrió un error al crear el llamado.";
  }
  fetchCalls();
  fetchCreators();
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
        <v-btn color="success" @click="openCreateDialog" :loading="isCreating">
          Crear llamado
        </v-btn>
      </v-col>
    </v-row>

    <!-- Diálogo crear llamado -->
    <v-dialog v-model="showCreateDialog" max-width="600px" persistent>
      <v-card>
        <v-card-title class="text-h6 d-flex align-center">
          <v-btn
            icon
            variant="text"
            @click="
              resetCreateForm();
              resetCreateStatus();
            "
            :disabled="isCreating"
            class="me-2"
          >
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          Crear nuevo llamado
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="createCall">
            <v-text-field
              v-model="newCallName"
              label="Nombre del llamado"
              suffix=".llamados.cfp"
              hint="Solo letras, números y guiones. Sin espacios ni caracteres especiales."
              persistent-hint
              :rules="[
                (v) => !!v || 'El nombre es requerido',
                (v) =>
                  /^[a-zA-Z0-9-]+$/.test(v) ||
                  'Solo se permiten letras, números y guiones',
              ]"
              :disabled="isCreating"
              required
            />
            <v-textarea
              v-model="newCallDescription"
              label="Descripción del llamado"
              hint="Descripción que aparecerá asociada al nombre ENS"
              persistent-hint
              :rules="[(v) => !!v || 'La descripción es requerida']"
              auto-grow
              :disabled="isCreating"
              required
              rows="3"
            />
            <v-text-field
              v-model="newClosingDate"
              label="Fecha y hora de cierre"
              type="datetime-local"
              :rules="[
                (v) => !!v || 'La fecha de cierre es requerida',
                (v) => {
                  if (!v) return true;
                  const date = new Date(v);
                  const now = new Date();
                  return (
                    date > now ||
                    'La fecha de cierre debe ser posterior a la fecha y hora actual'
                  );
                },
              ]"
              :disabled="isCreating"
              required
            />
          </v-form>

          <v-alert
            v-if="createError || createSuccess"
            :type="createError ? 'error' : 'success'"
            class="mt-3"
            border="start"
            variant="tonal"
          >
            {{ createError || createMessage }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            @click="createCall"
            color="primary"
            :loading="isCreating"
            :disabled="!isFormValid || isCreating"
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
