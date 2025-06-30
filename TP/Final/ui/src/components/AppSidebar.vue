<script setup lang="ts">
import { useCFPFactoryIsOwner } from "@/composables/contracts/CFPFactory/useCFPFactoryIsOwner";
import { computed } from "vue";

const { isOwner } = useCFPFactoryIsOwner();

const links = computed(() => {
  const baseLinks = [
    { title: "Inicio", icon: "mdi-home", to: "/" },
    { title: "Registrar ENS", icon: "mdi-account-key", to: "/ens-register" },
    { title: "Llamados", icon: "mdi-file-document-multiple", to: "/calls" },
  ];
  if (isOwner.value) {
    baseLinks.push({
      title: "Gestión de Usuarios",
      icon: "mdi-account-cog",
      to: "/users",
    });
  }

  return baseLinks;
});
</script>

<template>
  <v-navigation-drawer permanent class="app-sidebar" width="210" elevation="0">
    <v-container class="text-center py-6">
      <v-img src="smart-contract.png" width="40" class="mx-auto mb-2" />
      <span class="font-weight-bold text-white text-h6">CFP</span>
    </v-container>

    <v-divider class="mb-2" />

    <v-list nav density="compact">
      <v-list-item
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        :title="link.title"
        :prepend-icon="link.icon"
        class="sidebar-link"
      />
    </v-list>
  </v-navigation-drawer>
</template>

<style scoped>
.app-sidebar {
  background-color: #294c77 !important;
  color: white;
  border-right: none;
  box-shadow: none;
}
.sidebar-link {
  color: white;
}
.sidebar-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
