import { computed, ref, watch, toRaw } from "vue";
import { Contract } from "ethers";
import { storeToRefs } from "pinia";

import cfpArtifact from "../../../../contracts/build/contracts/CFP.json";
import { useMetamask } from "@/composables/metamask/useMetamask";
import { useCallDetailStore } from "@/store/callDetail";

const ABI = cfpArtifact.abi;

export function useCFP() {
  const { signer } = useMetamask();
  const callDetailStore = useCallDetailStore();
  const { call } = storeToRefs(callDetailStore);

  const cfpAddress = computed(() => call.value?.cfp || "");
  const contract = ref<Contract | null>(null);

  // Inicializar el contrato CFP
  const init = async () => {
    const rawSigner = toRaw(signer.value);
    const address = cfpAddress.value;

    if (!rawSigner) throw new Error("Signer no disponible");
    if (!address?.startsWith("0x") || address.length !== 42) {
      throw new Error("Dirección del contrato CFP no válida");
    }

    // Solo crear si cambia la dirección o el signer
    if (
      !contract.value ||
      String(contract.value.address).toLowerCase() !==
        String(address).toLowerCase()
    ) {
      contract.value = new Contract(address, ABI, rawSigner);
    }
  };

  // Re-inicializar solo si cambian dirección o signer y si ambos son válidos
  watch(
    [cfpAddress, signer],
    async ([newAddress, newSigner]) => {
      if (
        newAddress?.startsWith("0x") &&
        newAddress.length === 42 &&
        newSigner
      ) {
        try {
          await init();
        } catch (error) {
          //console.error("Error inicializando contrato CFP:", error);
        }
      } else {
        contract.value = null;
      }
    },
    { immediate: true }
  );

  // Obtener datos de una propuesta
  const getProposalData = async (proposalId: string) => {
    if (!contract.value) throw new Error("Contrato CFP no inicializado");
    return contract.value.proposalData(proposalId);
  };

  return {
    contract,
    getProposalData,
    init,
  };
}
