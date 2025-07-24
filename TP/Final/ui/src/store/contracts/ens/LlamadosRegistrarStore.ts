import { defineStore } from "pinia";
import { ref } from "vue";
import type { LlamadosRegistrar } from "@/services/contracts/types";

export const useLlamadosRegistrarStore = defineStore(
  "llamadosRegistrar",
  () => {
    const contract = ref<LlamadosRegistrar>();

    const initContract = (instance: LlamadosRegistrar) => {
      contract.value = instance;
    };

    return {
      contract,
      initContract,
    };
  }
);
