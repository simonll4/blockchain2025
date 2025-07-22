import { computed, toRaw, watch } from "vue";
import { storeToRefs } from "pinia";
import { isAddress } from "ethers";

import { useMetamask } from "@/services/metamask/useMetamask";
import { CFP__factory, type CFP } from "@/services/contracts/types";
import { useCallDetailStore } from "@/store/callDetailStore";
import { useCFPStore } from "@/store/contracts/business/CFPStore";
import { usePublicResolver } from "@/services/contracts/ens/usePublicResolver";
import { namehash } from "@/utils/ens";

/**
 * Composable para interactuar con el contrato CFP (Call for Proposals).
 */
export function useCFP() {
  const { signer } = useMetamask();
  const callDetailStore = useCallDetailStore();
  const { call } = storeToRefs(callDetailStore);
  const cfpStore = useCFPStore();
  const { contract } = storeToRefs(cfpStore);

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

  const getContract = (): CFP => {
    const rawContract = toRaw(contract.value);
    if (!rawContract) throw new Error("Contrato CFP no inicializado");
    return rawContract;
  };

  /* METODOS DEL CONTRATO */

  const getProposalData = async (proposalId: string) => {
    return getContract().proposalData(proposalId);
  };

  const getOwner = async () => {
    return getContract().owner();
  };

  return {
    contract,
    getOwner,
    getProposalData,
    init,
  };
}
