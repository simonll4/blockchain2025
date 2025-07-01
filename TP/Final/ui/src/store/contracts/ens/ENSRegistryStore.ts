import { defineStore } from "pinia";
import { ref } from "vue";
import type { ENSRegistry } from "@/services/contracts/types";

export const useENSRegistryStore = defineStore("ensRegistry", () => {
  const contract = ref<ENSRegistry>();

  const initContract = (instance: ENSRegistry, address: string) => {
    contract.value = instance;
  };

  const getContract = (): ENSRegistry => {
    if (!contract.value) {
      throw new Error(
        "ENSRegistry no inicializado. Llama primero a `initContract`."
      );
    }
    return contract.value;
  };

  return {
    contract,
    initContract,
    getContract,
  };
});
