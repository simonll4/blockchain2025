import { defineStore } from "pinia";
import { ref, toRaw } from "vue";
import type { ENSRegistry } from "@/services/contracts/types";

export const useENSRegistryStore = defineStore("ensRegistry", () => {
  const contract = ref<ENSRegistry>();

  const initContract = (instance: ENSRegistry) => {
    contract.value = instance;
  };

  return {
    contract,
    initContract,
  };
});
