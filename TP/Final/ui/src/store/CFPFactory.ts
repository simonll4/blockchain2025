import { defineStore } from "pinia";
import { ref } from "vue";
import type { Contract } from "ethers";

export const useCFPFactoryStore = defineStore("contract", () => {
  const contract = ref<Contract>();
  const factoryAddress = ref<string>("");

  const initContract = (instance: Contract, address: string) => {
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