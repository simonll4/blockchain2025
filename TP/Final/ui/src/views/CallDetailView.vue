<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { format, parseISO } from "date-fns";

import { useApiCallDetail } from "@/composables/api/useApiCallDetail";
import { useApiRegisterProposal } from "@/composables/api/useApiRegisterProposal";
import { useApiVerifyProposal } from "@/composables/api/useApiVerifyProposal";
import { useCFPFactoryRegisterProposal } from "@/composables/contracts/CFPFactory/useCFPFactoryRegisterProposal";
import { useCFPProposalData } from "@/composables/contracts/CFP/useCFPProposalData";
import { useMetamask } from "@/services/metamask/useMetamask";
import { useENSRegisterCall } from "@/composables/contracts/ens/useENSRegisterCall";
import { useCFPFactoryIsOwner } from "@/composables/contracts/CFPFactory/useCFPFactoryIsOwner";

const { isConnected } = useMetamask();

const route = useRoute();
const router = useRouter();
const callId = route.params.callId as string;

const {
  fetchCallDetail,
  call,
  isLoading: callLoading,
} = useApiCallDetail(callId);

// Cargar detalle del llamado al montar el componente resolver el creador
onMounted(async () => {
  fetchCallDetail();
});

const {checkIsOwner, isOwner} = useCFPFactoryIsOwner();

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
const {
  proposalData,
  fetchProposalData,
  message: messageProposalData,
} = useCFPProposalData();
const { isLoading, error, message, register } =
  useCFPFactoryRegisterProposal(callId);

// registrar propuesta on-chain
const onChainFile = ref<File | null>(null);
const handleRegisterOnChain = async () => {
  if (!onChainFile.value) return;

  await fetchProposalData(onChainFile.value);
  const sender = proposalData.value[0];

  // Si ya tiene un sender registrado, no permitir re-registro
  if (sender && sender !== "0x0000000000000000000000000000000000000000") {
    message.value = "";
    error.value = "La propuesta ya ha sido registrada.";
    return;
  }

  // Intentar registrar - si ya existe anónimamente, el contrato fallará
  await register(onChainFile.value);
};

function goBack() {
  router.push("/calls");
}

const formatDate = (iso?: string) => {
  if (!iso) return "N/A";
  return format(parseISO(iso), "dd/MM/yyyy HH:mm");
};

// Verificar si call.cfp es una dirección para mostrar el botón de registro ENS
const isAddress = (value?: string) => {
  if (!value) return false;
  return /^0x[a-fA-F0-9]{40}$/.test(value);
};

const canRegisterENS = computed(() => {
  return isConnected.value && isAddress(call.value?.cfp);
});

// ENS Registration
const {
  registerCall,
  isLoading: ensLoading,
  error: ensError,
  success: ensSuccess,
  message: ensMessage,
} = useENSRegisterCall();

const showENSDialog = ref(false);
const ensCallName = ref("");
const ensDescription = ref("");

const handleENSRegister = async () => {
  if (
    !call.value?.cfp ||
    !ensCallName.value.trim() ||
    !ensDescription.value.trim()
  ) {
    return;
  }

  const label = ensCallName.value.trim();
  const fullDomain = `${label}.llamados.cfp`;

  const success = await registerCall(
    label,
    fullDomain,
    call.value.cfp,
    ensDescription.value.trim()
  );

  if (success) {
    showENSDialog.value = false;
    ensCallName.value = "";
    ensDescription.value = "";
    // Refrescar los datos del llamado para obtener el nuevo nombre
    await fetchCallDetail();
  }
};

const openENSDialog = () => {
  ensCallName.value = "";
  ensDescription.value = "";
  showENSDialog.value = true;
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
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </v-card-title>

      <!-- Detalle del llamado -->
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
      <!-- Contenido real una vez cargado -->
      <v-sheet
        v-else
        elevation="2"
        class="pa-6 mb-6 rounded-xl position-relative"
        color="grey-lighten-5"
      >
        <!-- Botón de registro ENS en la esquina superior derecha -->
        <v-btn
          v-if="canRegisterENS"
          @click="openENSDialog"
          color="primary"
          variant="elevated"
          size="small"
          class="position-absolute"
          style="top: 16px; right: 16px; z-index: 2"
          prepend-icon="mdi-web"
        >
          Registrar ENS
        </v-btn>

        <v-row>
          <v-col cols="12">
            <h2 class="text-h5 font-weight-bold mb-3">
              📄 CFP: {{ call?.cfp || "Sin título" }}
            </h2>
          </v-col>

          <v-col cols="12" class="mb-2">
            <v-icon size="20" class="me-1">mdi-account-circle</v-icon>
            <strong>Creador:</strong>
            <div class="ms-4">{{ call?.creator || "No disponible" }}</div>
          </v-col>

          <v-col cols="12" class="mb-2">
            <v-icon size="20" class="me-1">mdi-text-box-outline</v-icon>
            <strong>Descripción:</strong>
            <div class="ms-4 text-truncate-break">
              {{ call?.description || "Sin descripción" }}
            </div>
          </v-col>

          <v-col cols="12" class="mt-4">
            <v-chip
              color="deep-purple-accent-2"
              text-color="white"
              size="small"
              style="font-weight: bold; font-size: 0.85rem"
              variant="elevated"
            >
              Cierra: {{ formatDate(call?.closingTime) }}
            </v-chip>
          </v-col>
        </v-row>
      </v-sheet>

      <v-divider class="my-4" />

      <!-- Registrar Propuesta (Solo si no es owner) -->
      <div v-if="!isOwner">
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
      </div>

      <v-divider v-if="!isOwner" class="my-4" />

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

    <!-- Diálogo para registro ENS -->
    <v-dialog v-model="showENSDialog" max-width="500px" persistent>
      <v-card>
        <v-card-title class="text-h6">Registrar nombre ENS</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="handleENSRegister">
            <v-text-field
              v-model="ensCallName"
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
              required
            />
            <v-textarea
              v-model="ensDescription"
              label="Descripción del llamado"
              hint="Descripción que aparecerá asociada al nombre ENS"
              persistent-hint
              :rules="[(v) => !!v || 'La descripción es requerida']"
              required
              rows="3"
            />
          </v-form>

          <v-alert
            v-if="ensError || ensSuccess"
            :type="ensError ? 'error' : 'success'"
            class="mt-3"
            border="start"
            variant="tonal"
          >
            {{ ensError || ensMessage }}
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn @click="showENSDialog = false" :disabled="ensLoading">
            Cancelar
          </v-btn>
          <v-btn
            @click="handleENSRegister"
            color="primary"
            :loading="ensLoading"
            :disabled="!ensCallName.trim() || !ensDescription.trim()"
          >
            Registrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.text-truncate-break {
  word-break: break-word;
  white-space: normal;
}
</style>
