import { defineStore } from "pinia";
import { ref } from "vue";
import type { CFP } from "@/services/contracts/types";

export const useCFPStore = defineStore("cfpContract", () => {
  const contract = ref<CFP>();
  const cfpAddress = ref<string>("");

  const initContract = (instance: CFP, address: string) => {
    contract.value = instance;
    cfpAddress.value = address;
  };

  const getContract = (): CFP => {
    if (!contract.value) {
      throw new Error("Contrato CFP no inicializado");
    }
    return contract.value;
  };

  return {
    contract,
    cfpAddress,
    initContract,
    getContract,
  };
});
