import { defineStore } from "pinia";
import { ref } from "vue";
import type { Contract } from "ethers";

import type { CFPFactory } from "@/services/contracts/types";

export const useCFPFactoryStore = defineStore("contract", () => {
  const contract = ref<CFPFactory>();
  const factoryAddress = ref<string>("");

  const initContract = (instance: CFPFactory, address: string) => {
    contract.value = instance;
    factoryAddress.value = address;
  };

  const getContract = (): Contract => {
    if (contract) {
      throw new Error("Contrato no inicializado. Llama primero a `init`.");
    }
    return contract;
  };

  return {
    factoryAddress,
    contract,
    initContract,
    getContract,
  };
});