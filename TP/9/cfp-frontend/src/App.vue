<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>Gestión de Llamados a Propuestas (CFP) </v-toolbar-title>
      <v-spacer />
    </v-app-bar>

    <v-main>
      <v-container class="py-4">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
// Vuetify y router están automáticamente disponibles en main.js
</script>

<style scoped>
/* Estilos opcionales si querés ajustar */
</style>
