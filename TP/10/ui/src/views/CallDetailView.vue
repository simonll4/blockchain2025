<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCallDetail } from "@/composables/useCallDetail";
import { useRegisterProposal } from "@/composables/useRegisterProposal";
import { useVerifyProposal } from "@/composables/useVerifyProposal";
import { format, parseISO } from "date-fns";

const route = useRoute();
const router = useRouter();

const callId = route.params.callId as string;

function goBack() {
  router.push("/calls");
}

const { fetchCallDetail, call, isLoading: callLoading } = useCallDetail(callId);

const {
  registerProposal,
  isLoading: isLoadingRegisterProposal,
  message: messageRegisterProposal,
  error: errorRegisterProposal,
} = useRegisterProposal(callId);

const {
  verifyProposal,
  isLoading: isLoadingVerifyProposal,
  message: messageVerifyProposal,
  error: errorVerifyProposal,
} = useVerifyProposal(callId);

onMounted(() => {
  fetchCallDetail();
});

// Registrar propuesta
const registerFile = ref<File | null>(null);
const handleRegister = async () => {
  if (registerFile.value) {
    await registerProposal(registerFile.value);
  }
};

// Verificar propuesta
const verifyFile = ref<File | null>(null);
const handleVerify = async () => {
  if (verifyFile.value) {
    await verifyProposal(verifyFile.value);
  }
};

const formatDate = (iso?: string) => {
  if (!iso) return "N/A";
  return format(parseISO(iso), "dd/MM/yyyy HH:mm");
};
</script>

<template>
  <v-container fluid class="fill-height d-flex justify-center align-start">
    <v-card class="pa-4" max-width="1000px" width="100%">
      <!-- Botón de volver -->
      <v-card-title class="pa-0">
        <v-btn
          variant="text"
          @click="goBack"
          class="position-absolute top-0 start-0 mt-2 ms-2 z-index-1"
          style="min-width: unset"
        >
          <img
            src="@/assets/arrow-left-solid.svg"
            alt="Volver"
            width="15"
            height="20"
          />
        </v-btn>
      </v-card-title>

      <!-- Detalle del llamado -->
      <v-card-title class="text-h6 mt-4 mb-2">Detalle del Llamado</v-card-title>
      <v-sheet
        elevation="1"
        class="pa-4 mb-4 rounded-lg"
        color="grey-lighten-4"
      >
        <v-row dense>
          <v-col cols="12" class="mb-2">
            <strong>ID:</strong>
            <div class="text-truncate-break">{{ callId }}</div>
          </v-col>
          <v-col cols="12" class="mb-2">
            <strong>CFP:</strong>
            <div class="text-truncate-break">{{ call?.cfp }}</div>
          </v-col>
          <v-col cols="12">
            <strong>Creador:</strong>
            <div class="text-truncate-break">{{ call?.creator }}</div>
          </v-col>
          <v-col cols="12" class="mb-2">
            <strong>Fecha de cierre:</strong>
            <div>
              {{
                call?.closingTime
                  ? formatDate(call.closingTime)
                  : "Fecha no disponible"
              }}
            </div>
          </v-col>
        </v-row>
      </v-sheet>

      <v-divider class="my-4" />

      <!-- Registrar Propuesta -->
      <v-card-title class="text-h6">Registrar una nueva propuesta</v-card-title>
      <v-row dense>
        <v-col cols="12" md="8">
          <v-file-input
            v-model="registerFile"
            label="Seleccionar archivo de propuesta"
            prepend-icon="mdi-upload"
            hide-details
          />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-end">
          <v-btn
            @click="handleRegister"
            color="primary"
            :loading="isLoadingRegisterProposal"
            block
            :disabled="!registerFile"
          >
            Registrar
          </v-btn>
        </v-col>
      </v-row>
      <v-alert
        v-if="messageRegisterProposal"
        :type="errorRegisterProposal ? 'error' : 'success'"
        class="my-2"
        border="start"
        variant="tonal"
      >
        {{ messageRegisterProposal }}
      </v-alert>

      <v-divider class="my-4" />

      <!-- Verificar Propuesta -->
      <v-card-title class="text-h6">Verificar propuesta existente</v-card-title>
      <v-row dense>
        <v-col cols="12" md="8">
          <v-file-input
            v-model="verifyFile"
            label="Seleccionar archivo a verificar"
            prepend-icon="mdi-upload"
            hide-details
          />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-end">
          <v-btn
            @click="handleVerify"
            color="secondary"
            :loading="isLoadingVerifyProposal"
            block
            :disabled="!verifyFile"
          >
            Verificar
          </v-btn>
        </v-col>
      </v-row>
      <v-alert
        v-if="messageVerifyProposal"
        :type="errorVerifyProposal ? 'error' : 'success'"
        class="my-2"
        border="start"
        variant="tonal"
      >
        {{ messageVerifyProposal }}
      </v-alert>
    </v-card>
  </v-container>
</template>

<style scoped>
.text-truncate-break {
  word-break: break-word;
  white-space: normal;
}
</style>
