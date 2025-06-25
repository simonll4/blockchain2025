<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { format, parseISO } from "date-fns";

import { shorten } from "@/utils/format";
import { useUserStore } from "@/store/userStore";

import { useApiCalls } from "@/composables/api/useApiCalls";
import { useApiCreators } from "@/composables/api/useApiCreators";
import { useCFPFactoryCreate } from "@/composables/contracts/CFPFactory/useCFPFactoryCreate";
import { useCFPFactoryIsAuthorized } from "@/composables/contracts/CFPFactory/useCFPFactoryIsAuthorized";

const userStore = useUserStore();
const userAddress = computed(() => userStore.address);

// Verificar si el usuario está autorizado para crear llamados
const { isAuthorized } = useCFPFactoryIsAuthorized();

// Cargar creadores y llamados al montar el componente
const { fetchCreators, creators, loading } = useApiCreators();
const { fetchCalls, calls, isLoading, error } = useApiCalls();

// Tabs y creadores seleccionados
const activeTab = ref(0);
const selectedCreators = ref<string[]>([]);

// Filtrar llamados por creadores seleccionados
const filteredCalls = computed(() => {
  if (activeTab.value !== 0) return [];
  if (!selectedCreators.value.length) return calls.value;
  return calls.value.filter((call) =>
    selectedCreators.value.includes(call.creator)
  );
});

// Filtrar llamados propios
const myCalls = computed(() => {
  if (activeTab.value !== 1) return [];
  if (!userAddress.value) return [];
  return calls.value.filter(
    (call) => call.creator.toLowerCase() === userAddress.value.toLowerCase()
  );
});

// Función para crear un nuevo llamado
const {
  isLoading: isCreating,
  error: createError,
  success: createSuccess,
  message: createMessage,
  create,
} = useCFPFactoryCreate();

const showCreateDialog = ref(false);
const newCallId = ref("");
const newClosingDate = ref("");

const resetCreateForm = () => {
  newCallId.value = "";
  newClosingDate.value = "";
  showCreateDialog.value = false;
};

// Funcion para crear un nuevo llamado
const createCall = async () => {
  if (!newCallId.value) {
    createError.value = "Debe ingresar un ID para el llamado.";
    return;
  }
  if (!newClosingDate.value) {
    createError.value = "Debe seleccionar una fecha de cierre.";
    return;
  }
  const isValidCallId = /^0x[a-fA-F0-9]{64}$/.test(newCallId.value);
  if (!isValidCallId) {
    createError.value =
      "El ID debe comenzar con '0x' y contener 64 caracteres hexadecimales.";
    return;
  }

  // Verificar si ya existe
  const alreadyExists = calls.value.some(
    (call) => call.callId === newCallId.value
  );
  if (alreadyExists) {
    createError.value = "Ya existe un llamado con ese ID.";
    return;
  }

  try {
    const closingTimestamp = Math.floor(
      new Date(newClosingDate.value).getTime() / 1000
    );
    await create(newCallId.value, closingTimestamp);
    fetchCalls();
    fetchCreators();
    resetCreateForm();
  } catch (err) {
    //console.error("Error al crear llamado:", err);
    createError.value = "Ocurrió un error al crear el llamado.";
  }
};

const formatDate = (iso?: string) => {
  if (!iso) return "N/A";
  return format(parseISO(iso), "dd/MM/yyyy HH:mm");
};
</script>

<template>
  <v-container>
    <!-- BOTÓN crear llamado si hay usuario logueado -->
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

    <!-- Diálogo para crear llamado -->
    <v-dialog v-model="showCreateDialog" max-width="500px">
      <v-card>
        <v-card-title>Crear nuevo llamado</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newCallId"
            label="ID del llamado"
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
          <v-alert v-if="createError" type="error" dense>{{
            createError
          }}</v-alert>
          <v-alert v-if="createSuccess" type="success" dense>{{
            createMessage
          }}</v-alert>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn text @click="showCreateDialog = false" :disabled="isCreating"
            >Cancelar</v-btn
          >
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

    <!-- Contenido Tab 1 -->
    <div v-show="activeTab === 0" class="mt-4">
      <v-row class="mb-4" align="center">
        <v-col cols="12" md="6" lg="4">
          <v-select
            v-model="selectedCreators"
            :items="creators"
            :item-title="shorten"
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
          <v-card class="pa-4" elevation="3">
            <v-card-title class="text-h6">
              Llamado: {{ shorten(call.callId) }}
            </v-card-title>

            <v-card-text>
              <div class="mb-2">
                <strong>Creador:</strong>
                <v-chip
                  class="ma-1"
                  color="blue-grey-lighten"
                  text-color="black"
                >
                  {{ shorten(call.creator) }}
                </v-chip>
              </div>

              <div>
                <strong>Dirección CFP:</strong>
                <v-chip class="ma-1" color="blue-lighten-1" text-color="black">
                  {{ shorten(call.cfpAddress) }}
                </v-chip>
              </div>

              <div>
                <strong>Cierra el:</strong>
                <v-chip class="ma-1" color="green-lighten-1" text-color="black">
                  {{ formatDate(call.closingTime) }}
                </v-chip>
              </div>
            </v-card-text>

            <v-card-actions class="justify-end">
              <v-btn
                :to="`/call/${call.callId}`"
                color="primary"
                variant="flat"
              >
                Ver detalle
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Contenido Tab 2 -->
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
          <v-card class="pa-4" elevation="3">
            <v-card-title class="text-h6">
              Llamado: {{ shorten(call.callId) }}
            </v-card-title>

            <v-card-text>
              <div class="mb-2">
                <strong>Creador:</strong>
                <v-chip
                  class="ma-1"
                  color="blue-grey-lighten"
                  text-color="black"
                >
                  {{ shorten(call.creator) }}
                </v-chip>
              </div>

              <div>
                <strong>Dirección CFP:</strong>
                <v-chip class="ma-1" color="blue-lighten-1" text-color="black">
                  {{ shorten(call.cfpAddress) }}
                </v-chip>
              </div>

              <div>
                <strong>Cierra el:</strong>
                <v-chip class="ma-1" color="green-lighten-1" text-color="black">
                  {{ formatDate(call.closingTime) }}
                </v-chip>
              </div>
            </v-card-text>

            <v-card-actions class="justify-end">
              <v-btn
                :to="`/call/${call.callId}`"
                color="primary"
                variant="flat"
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
