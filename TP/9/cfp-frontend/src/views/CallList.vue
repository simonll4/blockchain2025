<template>
  <v-container>
    <v-row dense>
      <v-col v-for="call in calls" :key="call.callId" cols="12" md="6" lg="4">
        <v-card class="pa-4" elevation="3">
          <v-card-title class="text-h6"
            >Llamado: {{ shortenAddress(call.callId) }}</v-card-title
          >
          <v-card-text>
            <div class="mb-2">
              <strong>Creador:</strong>
              <v-chip
                class="ma-1"
                color="blue-grey lighten-4"
                text-color="black"
              >
                {{ shortenAddress(call.creator) }}
              </v-chip>
            </div>
            <div>
              <strong>Dirección CFP:</strong>
              <v-chip class="ma-1" color="blue lighten-4" text-color="black">
                {{ shortenAddress(call.cfpAddress) }}
              </v-chip>
            </div>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn
              :to="`/register/${call.callId}`"
              color="primary"
              variant="flat"
              class="me-2"
            >
              Registrar
            </v-btn>
            <v-btn
              :to="`/verify/${call.callId}`"
              color="secondary"
              variant="flat"
            >
              Verificar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { getCalls } from "@/services/api";

const calls = ref([]);

onMounted(async () => {
  try {
    const { data } = await getCalls();
    calls.value = data;
  } catch (err) {
    console.error("Error cargando los llamados:", err);
  }
});

// Función utilitaria para acortar direcciones Ethereum
function shortenAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
</script>