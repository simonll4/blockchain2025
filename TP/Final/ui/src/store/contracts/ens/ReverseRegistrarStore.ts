import { defineStore } from "pinia";
import { ref } from "vue";
import type { ReverseRegistrar } from "@/services/contracts/types";

export const useReverseRegistrarStore = defineStore("reverseRegistrar", () => {
  const contract = ref<ReverseRegistrar>();

  const initContract = (instance: ReverseRegistrar) => {
    contract.value = instance;
  };

  return {
    contract,
    initContract,
  };
});
