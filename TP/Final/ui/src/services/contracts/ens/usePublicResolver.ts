import { toRaw } from "vue";
import { storeToRefs } from "pinia";

import { useMetamask } from "@/services/metamask/useMetamask";
import { usePublicResolverStore } from "@/store/contracts/ens/PublicResolverStore";
import { PublicResolver__factory } from "@/services/contracts/types/factories/PublicResolver__factory";
import type { PublicResolver } from "@/services/contracts/types/PublicResolver";
import contractsConfig from "../../../../contractsConfig.json";

const ADDRESS = contractsConfig.contracts.publicResolver;

/**
 * Composable para interactuar con el contrato PublicResolver.
 */
export function usePublicResolver() {
  const store = usePublicResolverStore();
  const { contract } = storeToRefs(store);
  const { signer } = useMetamask();

  const init = async () => {
    const rawSigner = toRaw(signer.value);
    if (!rawSigner) throw new Error("Signer no disponible");

    const instance = PublicResolver__factory.connect(ADDRESS, rawSigner);
    store.initContract(instance);
  };

  const getContract = (): PublicResolver => {
    const rawContract = toRaw(contract.value);
    if (!rawContract) throw new Error("PublicResolver no inicializado");
    return rawContract;
  };

  /* METODOS DEL CONTRATO */

  const getAddr = async (node: string): Promise<string> => {
    return getContract().addr(node);
  };

  const setAddr = async (node: string, addr: string) => {
    return getContract().setAddr(node, addr);
  };

  const getName = async (node: string): Promise<string> => {
    return getContract().name(node);
  };

  const setName = async (node: string, name: string) => {
    return getContract().setName(node, name);
  };

  const setText = async (node: string, key: string, value: string) => {
    return getContract().setText(node, key, value);
  };

  return {
    init,
    contract,
    contractAddress: ADDRESS,
    getAddr,
    setAddr,
    getName,
    setName,
    setText,
  };
}
