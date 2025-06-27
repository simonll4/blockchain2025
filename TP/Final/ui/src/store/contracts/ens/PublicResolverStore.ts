import { defineStore } from "pinia";
import { ref } from "vue";
import type { PublicResolver } from "@/services/contracts/types";

export const usePublicResolverStore = defineStore("publicResolver", () => {
  const contract = ref<PublicResolver>();
  const contractAddress = ref<string>("");

  const initContract = (instance: PublicResolver, address: string) => {
    contract.value = instance;
    contractAddress.value = address;
  };

  const getContract = (): PublicResolver => {
    if (!contract.value) {
      throw new Error(
        "PublicResolver no inicializado. Llama primero a `initContract`."
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
