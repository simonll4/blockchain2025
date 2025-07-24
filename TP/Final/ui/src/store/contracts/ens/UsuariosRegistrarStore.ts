import { defineStore } from "pinia";
import { ref } from "vue";

import type { UsuariosRegistrar } from "@/services/contracts/types";

export const useUsuariosRegistrarStore = defineStore(
  "usuariosRegistrar",
  () => {
    const contract = ref<UsuariosRegistrar>();

    const initContract = (instance: UsuariosRegistrar) => {
      contract.value = instance;
    };

    return {
      contract,
      initContract,
    };
  }
);
