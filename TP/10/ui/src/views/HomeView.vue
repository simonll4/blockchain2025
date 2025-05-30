<script setup>
import { useMetamask } from "@/composables/useMetamask";

let isAdmin = false; //TODO: Replace with actual admin check logic
let isAuthorized = false; //TODO: Replace with actual authorization check logic
let apiHealthy = false; //TODO: Replace with actual API health check logic

const { isConnected, networkOk } = useMetamask();

function registerUser() {
  userStore.register();
}
</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card class="pa-6" elevation="3">
          <v-card-title class="text-h5 mb-4"> Estado del Usuario </v-card-title>

          <v-list density="compact">
            <v-list-item>
              <v-list-item-title>
                Metamask:
                <v-chip :color="isConnected ? 'green' : 'red'" class="ml-2">
                  {{ isConnected ? "Conectado" : "No conectado" }}
                </v-chip>
              </v-list-item-title>
            </v-list-item>

            <v-list-item>
              <v-list-item-title>
                Red correcta:
                <v-chip :color="networkOk ? 'green' : 'red'" class="ml-2">
                  {{ networkOk ? "Sí" : "No" }}
                </v-chip>
              </v-list-item-title>
            </v-list-item>

            <v-list-item>
              <v-list-item-title>
                Conexión con la API:
                <v-chip :color="apiHealthy ? 'green' : 'red'" class="ml-2">
                  {{ apiHealthy ? "OK" : "Error" }}
                </v-chip>
              </v-list-item-title>
            </v-list-item>

            <v-list-item>
              <v-list-item-title>
                Usuario autorizado:
                <v-chip :color="isAuthorized ? 'green' : 'orange'" class="ml-2">
                  {{ isAuthorized ? "Sí" : "Pendiente/No registrado" }}
                </v-chip>
              </v-list-item-title>
            </v-list-item>

            <v-list-item>
              <v-list-item-title>
                ¿Es administrador?:
                <v-chip :color="isAdmin ? 'blue' : 'grey'" class="ml-2">
                  {{ isAdmin ? "Sí" : "No" }}
                </v-chip>
              </v-list-item-title>
            </v-list-item>
          </v-list>

          <v-divider class="my-4" />

          <div v-if="!isAuthorized" class="text-center">
            <v-btn color="primary" @click="registerUser">
              Solicitar Autorización
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
