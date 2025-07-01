import { defineStore } from "pinia";
import { ref } from "vue";
import type { LlamadosRegistrar } from "@/services/contracts/types";

export const useLlamadosRegistrarStore = defineStore(
  "llamadosRegistrar",
  () => {
    const contract = ref<LlamadosRegistrar>();

    const initContract = (instance: LlamadosRegistrar, address: string) => {
      contract.value = instance;
    };

    const getContract = (): LlamadosRegistrar => {
      if (!contract.value) {
        throw new Error(
          "Contrato LlamadosRegistrar no inicializado. Llama primero a `initContract`."
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
