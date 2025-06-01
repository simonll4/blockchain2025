<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { format, parseISO } from "date-fns";

import { useApiCallDetail } from "@/composables/api/useApiCallDetail";
import { useApiRegisterProposal } from "@/composables/api/useApiRegisterProposal";
import { useApiVerifyProposal } from "@/composables/api/useApiVerifyProposal";
import { useCFPFactoryRegisterProposal } from "@/composables/CFPFactory/useCFPFactoryRegisterProposal";
import { useCFPProposalData } from "@/composables/CFP/useCFPProposalData";

import { useMetamask } from "@/composables/useMetamask";

const { isConnected } = useMetamask();

const route = useRoute();
const router = useRouter();
const callId = route.params.callId as string;

const {
  fetchCallDetail,
  call,
  isLoading: callLoading,
} = useApiCallDetail(callId);

const {
  registerProposal,
  isLoading: isLoadingRegisterProposal,
  message: messageRegisterProposal,
  error: errorRegisterProposal,
} = useApiRegisterProposal(callId);

const {
  verifyProposal,
  isLoading: isLoadingVerifyProposal,
  message: messageVerifyProposal,
  error: errorVerifyProposal,
} = useApiVerifyProposal(callId);

onMounted(() => {
  fetchCallDetail();
});

// Registro de propuesta anónima
const registerFile = ref<File | null>(null);
const handleAnonymousRegister = async () => {
  if (registerFile.value) {
    await registerProposal(registerFile.value);
  }
};

// Verificar en backend
const verifyFile = ref<File | null>(null);
const handleVerify = async () => {
  if (verifyFile.value) {
    await verifyProposal(verifyFile.value);
  }
};

// Registrar directamente on-chain con Metamask
const { proposalData, fetchProposalData } = useCFPProposalData();
const { isLoading, error, message, register } =
  useCFPFactoryRegisterProposal(callId);

// registrar propuesta on-chain
const onChainFile = ref<File | null>(null);
const handleRegisterOnChain = async () => {
  if (!onChainFile.value) return;
  await fetchProposalData(onChainFile.value);
  const sender = proposalData.value?.sender;
  if (sender && sender !== "0x0000000000000000000000000000000000000000") {
    message.value = "";
    error.value = "La propuesta ya ha sido registrada on-chain.";
    return;
  }
  await register(onChainFile.value);
};

function goBack() {
  router.push("/calls");
}

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

      <!-- Skeleton Loader mientras carga -->
      <v-sheet
        v-if="callLoading"
        elevation="1"
        class="pa-4 mb-4 rounded-lg"
        color="grey-lighten-4"
      >
        <v-skeleton-loader type="heading" class="mb-3" />
        <v-skeleton-loader type="list-item-two-line@4" class="mb-2" />
      </v-sheet>

      <!-- Contenido real una vez cargado -->
      <v-sheet
        v-else
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
      <v-card-title class="text-h6">
        Registrar propuesta de forma anonima
      </v-card-title>
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
            @click="handleAnonymousRegister"
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

      <!-- Registrar Propuesta (On-Chain) -->
      <div v-if="isConnected">
        <v-card-title class="text-h6">
          Registrar propuesta con cuenta Metamask
        </v-card-title>
        <v-row dense>
          <v-col cols="12" md="8">
            <v-file-input
              v-model="onChainFile"
              label="Seleccionar archivo de propuesta"
              prepend-icon="mdi-upload"
              hide-details
            />
          </v-col>
          <v-col cols="12" md="4" class="d-flex align-end">
            <v-btn
              @click="handleRegisterOnChain"
              color="success"
              :loading="isLoading"
              block
              :disabled="!onChainFile"
            >
              Registrar con Metamask
            </v-btn>
          </v-col>
        </v-row>
        <v-alert
          v-if="message || error"
          :type="error ? 'error' : 'success'"
          class="my-2"
          border="start"
          variant="tonal"
        >
          {{ error || message }}
        </v-alert>
      </div>

      <v-divider class="my-4" />

      <!-- Verificar Propuesta -->
      <v-card-title class="text-h6">
        Verificar propuesta registrada
      </v-card-title>
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
