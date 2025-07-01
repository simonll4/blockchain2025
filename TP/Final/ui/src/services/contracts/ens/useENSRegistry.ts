import { toRaw } from "vue";
import { storeToRefs } from "pinia";

import { useMetamask } from "@/services/metamask/useMetamask";
import { useENSRegistryStore } from "@/store/contracts/ens/ENSRegistryStore";
import { ENSRegistry__factory } from "@/services/contracts/types/factories/ENSRegistry__factory";
import type { ENSRegistry } from "@/services/contracts/types/ENSRegistry";
import contractsConfig from "../../../../contractsConfig.json";

const ADDRESS = contractsConfig.contracts.ensRegistry;

/**
 * Composable para interactuar con el contrato ENSRegistry.
 */
export function useENSRegistry() {
  const store = useENSRegistryStore();
  const { contract } = storeToRefs(store);
  const { signer } = useMetamask();

  const init = async () => {
    const rawSigner = toRaw(signer.value);
    if (!rawSigner) throw new Error("Signer no disponible");
    const instance = ENSRegistry__factory.connect(ADDRESS, rawSigner);
    store.initContract(instance, ADDRESS);
  };

  const getContract = (): ENSRegistry => {
    const rawContract = toRaw(contract.value);
    if (!rawContract) throw new Error("ENSRegistry no inicializado");
    return rawContract;
  };

  /* METODOS DEL CONTRATO */

  const getOwner = async (node: string): Promise<string> => {
    return getContract().owner(node);
  };

  const setResolver = async (node: string, resolverAddress: string) => {
    return getContract().setResolver(node, resolverAddress);
  };

  return {
    init,
    contract,
    contractAddress: contract.value?.target,
    getOwner,
    setResolver,
  };
}
