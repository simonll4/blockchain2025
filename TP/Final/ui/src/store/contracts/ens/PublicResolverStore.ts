import { defineStore } from "pinia";
import { ref } from "vue";
import type { PublicResolver } from "@/services/contracts/types";

export const usePublicResolverStore = defineStore("publicResolver", () => {
  const contract = ref<PublicResolver>();

  const initContract = (instance: PublicResolver) => {
    contract.value = instance;
  };

  return {
    contract,
    initContract,
  };
});
