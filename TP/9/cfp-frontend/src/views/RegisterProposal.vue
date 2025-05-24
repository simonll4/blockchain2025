<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { sha256File } from "@/utils/hash";
import { messages } from "@/utils/messages";
import { registerProposal } from "@/services/api";

const file = ref(null);
const route = useRoute();
const router = useRouter();
const message = ref("");
const error = ref(false);
const loading = ref(false);

function goBack() {
  router.push("/");
}

async function submit() {
  if (!file.value) return;
  loading.value = true;
  message.value = "";
  try {
    const proposalHash = await sha256File(file.value);
    await registerProposal(route.params.callId, proposalHash);
    message.value = "Propuesta registrada correctamente";
    error.value = false;
  } catch (e) {
    const status = e.response?.status;
    const code = e.response?.data?.message || "";
    error.value = true;

    switch (code) {
      case messages.error.INVALID_MIMETYPE:
        message.value = messages.error.INVALID_MIMETYPE;
        break;
      case messages.error.INVALID_CALLID:
        message.value = messages.error.INVALID_CALLID;
        break;
      case messages.error.CALLID_NOT_FOUND:
        message.value = messages.error.CALLID_NOT_FOUND;
        break;
      case messages.error.INVALID_PROPOSAL:
        message.value = messages.error.INVALID_PROPOSAL;
        break;
      case messages.error.ALREADY_REGISTERED:
        message.value = messages.error.ALREADY_REGISTERED;
        break;
      case messages.error.INTERNAL_ERROR:
        message.value = "Error interno del servidor";
        break;
      default:
        message.value =
          status === 0
            ? "No se pudo conectar con el servidor"
            : "Error desconocido al registrar la propuesta";
        break;
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <v-container>
    <v-card class="pa-4">
      <!-- Header con botón de flecha y título -->
      <v-card-title class="d-flex align-center">
        <v-btn variant="text" @click="goBack" class="me-2 d-flex align-center">
          <img
            src="@/assets/arrow-left-solid.svg"
            alt="Volver"
            width="15"
            height="20"
          />
        </v-btn>
        <div>
          <div class="text-h6">Registrar Propuesta</div>
          <div class="text-caption text-medium-emphasis">
            ID del llamado: <strong>{{ route.params.callId }}</strong>
          </div>
        </div>
      </v-card-title>

      <!-- Contenido -->
      <v-row dense class="mt-2">
        <v-col cols="12" md="8">
          <v-file-input
            v-model="file"
            label="Seleccionar archivo de propuesta"
            prepend-icon="mdi-upload"
            hide-details
          />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-end">
          <v-btn @click="submit" color="primary" :loading="loading" block>
            Registrar
          </v-btn>
        </v-col>
      </v-row>

      <!-- Mensaje -->
      <v-alert
        v-if="message"
        :type="error ? 'error' : 'success'"
        class="mt-4"
        border="start"
        variant="tonal"
      >
        {{ message }}
      </v-alert>
    </v-card>
  </v-container>
</template>
