import { defineStore } from "pinia";
import { ref } from "vue";
import type { ReverseRegistrar } from "@/services/contracts/types";

export const useReverseRegistrarStore = defineStore("reverseRegistrar", () => {
  const contract = ref<ReverseRegistrar>();

  const initContract = (instance: ReverseRegistrar, address: string) => {
    contract.value = instance;
  };

  const getContract = (): ReverseRegistrar => {
    if (!contract.value) {
      throw new Error(
        "ReverseRegistrar no inicializado. Llama a `initContract`."
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
