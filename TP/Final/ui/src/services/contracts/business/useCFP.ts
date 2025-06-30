import { computed, toRaw, watch } from "vue";
import { storeToRefs } from "pinia";
import { isAddress } from "ethers";

import { useMetamask } from "@/services/metamask/useMetamask";
import { useCallDetailStore } from "@/store/callDetailStore";
import { useCFPStore } from "@/store/contracts/business/CFPStore";
import { usePublicResolver } from "@/services/contracts/ens/usePublicResolver";
import { namehash } from "@/utils/ens";
import { CFP__factory } from "@/services/contracts/types";

export function useCFP() {
  const { signer } = useMetamask();
  const callDetailStore = useCallDetailStore();
  const { call } = storeToRefs(callDetailStore);
  const cfpStore = useCFPStore();
  const { contract, cfpAddress } = storeToRefs(cfpStore);

  const { getAddr } = usePublicResolver();

  const resolvedAddress = computed(() => call.value?.cfp || "");

  const init = async () => {
    const rawSigner = toRaw(signer.value);
    if (!rawSigner) throw new Error("Signer no disponible");

    const rawCFP = resolvedAddress.value;
    let address: string;

    if (!rawCFP) {
      throw new Error("Dirección CFP no disponible");
    }

    if (isAddress(rawCFP)) {
      address = rawCFP;
    } else {
      const node = namehash(rawCFP);
      address = await getAddr(node);

      if (!isAddress(address)) {
        throw new Error(`No se pudo resolver el ENS: ${rawCFP}`);
      }
    }

    // Evitar reinstanciar si ya está creado para esa dirección
    if (
      !contract.value ||
      (await contract.value.getAddress()).toLowerCase() !==
        address.toLowerCase()
    ) {
      const instance = CFP__factory.connect(address, rawSigner);
      cfpStore.initContract(instance, address);
    }
  };

  watch(
    [resolvedAddress, signer],
    async ([newCFP, newSigner]) => {
      if (newCFP && newSigner) {
        try {
          await init();
        } catch (e) {
          console.error("Error al inicializar contrato CFP:", e);
        }
      }
    },
    { immediate: true }
  );

  const getProposalData = async (proposalId: string) => {
    if (!contract.value) throw new Error("Contrato CFP no inicializado");
    return contract.value.proposalData(proposalId);
  };

  return {
    contract,
    cfpAddress,
    getProposalData,
    init,
  };
}

// import { computed, ref, watch, toRaw } from "vue";
// import { storeToRefs } from "pinia";

// import { useMetamask } from "@/services/metamask/useMetamask";
// import { useCallDetailStore } from "@/store/callDetailStore";
// import { CFP__factory, type CFP } from "../types";

// export function useCFP() {
//   const { signer } = useMetamask();
//   const callDetailStore = useCallDetailStore();
//   const { call } = storeToRefs(callDetailStore);

//   const cfpAddress = computed(() => call.value?.cfp || "");
//   const contract = ref<CFP>();

//   // Inicializar el contrato CFP
//   const init = async () => {
//     const rawSigner = toRaw(signer.value);
//     const address = cfpAddress.value;
//     //console.log("Inicializando contrato CFP en:", address);

//     if (!rawSigner) throw new Error("Signer no disponible");
//     if (!address?.startsWith("0x") || address.length !== 42) {
//       throw new Error("Dirección del contrato CFP no válida");
//     }

//     // Solo crear si cambia la dirección o el signer
//     if (
//       !contract.value ||
//       String(contract.value.getAddress).toLowerCase() !==
//         String(address).toLowerCase()
//     ) {
//       contract.value = CFP__factory.connect(address, rawSigner);
//     }
//   };

//   // Re-inicializar solo si cambian dirección o signer y si ambos son válidos
//   watch(
//     [cfpAddress, signer],
//     async ([newAddress, newSigner]) => {
//       if (
//         newAddress?.startsWith("0x") &&
//         newAddress.length === 42 &&
//         newSigner
//       ) {
//         try {
//           await init();
//         } catch (error) {
//           //console.error("Error inicializando contrato CFP:", error);
//         }
//       }
//     },
//     { immediate: true }
//   );

//   // Obtener datos de una propuesta
//   const getProposalData = async (proposalId: string) => {
//     if (!contract.value) throw new Error("Contrato CFP no inicializado");
//     return contract.value.proposalData(proposalId);
//   };

//   return {
//     contract,
//     getProposalData,
//     init,
//   };
// }
