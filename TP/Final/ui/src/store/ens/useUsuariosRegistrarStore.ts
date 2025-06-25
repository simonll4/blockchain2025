import { defineStore } from "pinia";
import { ref } from "vue";

import type { UsuariosRegistrar } from "@/services/contracts/types";


export const useUsuariosRegistrarStore = defineStore(
  "usuariosRegistrar",
  () => {
    const contract = ref<UsuariosRegistrar>();
    const contractAddress = ref<string>("");

    const initContract = (instance: UsuariosRegistrar, address: string) => {
      contract.value = instance;
      contractAddress.value = address;
    };

    const getContract = (): UsuariosRegistrar => {
      if (!contract.value) {
        throw new Error(
          "Contrato UsuariosRegistrar no inicializado. Llama primero a `initContract`."
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
  }
);

// import { ref } from "vue";
// import { defineStore } from "pinia";

// import type { UsuariosRegistrar } from "@/services/contracts/types";

// export const useUsuariosRegistrarStore = defineStore(
//   "usuariosRegistrar",
//   () => {
//     const contract = ref<UsuariosRegistrar | null>(null);
//     const address = ref<string | null>(null);

//     function setContract(instance: UsuariosRegistrar) {
//       contract.value = instance;
//     }

//     function setAddress(addr: string) {
//       address.value = addr;
//     }

//     function reset() {
//       contract.value = null;
//       address.value = null;
//     }

//     return {
//       contract,
//       address,
//       setContract,
//       setAddress,
//       reset,
//     };
//   }
// );
