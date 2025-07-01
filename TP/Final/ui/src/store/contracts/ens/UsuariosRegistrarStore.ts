import { defineStore } from "pinia";
import { ref } from "vue";

import type { UsuariosRegistrar } from "@/services/contracts/types";

export const useUsuariosRegistrarStore = defineStore(
  "usuariosRegistrar",
  () => {
    const contract = ref<UsuariosRegistrar>();

    const initContract = (instance: UsuariosRegistrar, address: string) => {
      contract.value = instance;
    };

    const getContract = (): UsuariosRegistrar => {
      if (!contract.value) {
        throw new Error(
          "Contrato UsuariosRegistrar no inicializado. Llama primero a `initContract`."
        );
      }
      return contract.value;
    };

    return {
      contract,
      initContract,
      getContract,
    };
  }
);
