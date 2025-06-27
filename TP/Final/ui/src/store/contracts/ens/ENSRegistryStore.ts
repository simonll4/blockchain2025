// src/store/ens/useENSRegistryStore.ts
import { defineStore } from "pinia";
import { ref } from "vue";
import type { ENSRegistry } from "@/services/contracts/types";

export const useENSRegistryStore = defineStore("ensRegistry", () => {
  const contract = ref<ENSRegistry>();
  const contractAddress = ref<string>("");

  const initContract = (instance: ENSRegistry, address: string) => {
    contract.value = instance;
    contractAddress.value = address;
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
    contractAddress,
    initContract,
    getContract,
  };
});
