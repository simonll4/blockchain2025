import { defineStore } from "pinia";
import { ref } from "vue";
import type { Contract } from "ethers";

export const useContractStore = defineStore("contract", () => {
  const factoryAddress = ref<string>("");
  const contract = ref<Contract | null>(null);

  const setContract = (instance: Contract) => {
    contract.value = instance;
  };

  return {
    factoryAddress,
    contract,
    setContract,
  };
});
