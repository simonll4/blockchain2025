import { defineStore } from "pinia";
import { ref } from "vue";

import type { CFPFactory } from "@/services/contracts/types";

export const useCFPFactoryStore = defineStore("contract", () => {
  const contract = ref<CFPFactory>();

  const initContract = (instance: CFPFactory) => {
    contract.value = instance;
  };

  return {
    contract,
    initContract,
  };
});
