<script setup lang="ts">
import { ref } from "vue";
import { useFactory } from "@/composables/useCFPFactory";

const { register } = useFactory();
const loading = ref(false);

const registrar = async () => {
  loading.value = true;
  try {
    await register();
    alert("Registrado correctamente (pendiente de autorización)");
  } catch (err) {
    alert("Error al registrar");
    console.error(err);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <v-container>
    <h2>Gestión de Cuenta</h2>
    <v-btn @click="registrar" :loading="loading"
      >Registrarme para crear llamados</v-btn
    >
  </v-container>
</template>
