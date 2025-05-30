<script setup lang="ts">
import { onMounted } from "vue";
import { useCalls } from "@/composables/useCalls";
import { shorten } from "@/utils/format";
import { format, parseISO } from "date-fns";

const { fetchCalls, calls, isLoading } = useCalls();

const formatDate = (iso?: string) => {
  if (!iso) return "N/A";
  return format(parseISO(iso), "dd/MM/yyyy HH:mm");
};

onMounted(async () => {
  try {
    const res = await fetchCalls();
  } catch (err) {
    console.error("Error al obtener llamados:", err);
  }
});
</script>

<template>
  <v-container>
    <h2 class="text-h5 font-weight-medium mb-4">Llamados activos</h2>

    <v-row justify="center" v-if="isLoading">
      <v-col cols="auto">
        <v-progress-circular indeterminate color="primary" size="50" />
      </v-col>
    </v-row>

    <v-row v-else dense>
      <v-col v-for="call in calls" :key="call.callId" cols="12" md="6" lg="4">
        <v-card class="pa-4" elevation="3">
          <v-card-title class="text-h6">
            Llamado: {{ shorten(call.callId) }}
          </v-card-title>

          <v-card-text>
            <div class="mb-2">
              <strong>Creador:</strong>
              <v-chip class="ma-1" color="blue-grey-lighten" text-color="black">
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
            <v-btn :to="`/call/${call.callId}`" color="primary" variant="flat">
              Ver detalle
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
