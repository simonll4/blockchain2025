import { toRaw } from "vue";
import { storeToRefs } from "pinia";

import { useMetamask } from "@/services/metamask/useMetamask";
import { useReverseRegistrarStore } from "@/store/contracts/ens/ReverseRegistrarStore";
import { ReverseRegistrar__factory } from "@/services/contracts/types/factories/ReverseRegistrar__factory";
import type { ReverseRegistrar } from "../types";
import contractsConfig from "../../../../contractsConfig.json";

const ADDRESS = contractsConfig.contracts.reverseRegistrar;

/**
 * Composable para interactuar con el contrato ReverseRegistrar.
 */
export function useReverseRegistrar() {
  const store = useReverseRegistrarStore();
  const { contract } = storeToRefs(store);
  const { signer, account } = useMetamask();

  const init = async () => {
    const rawSigner = toRaw(signer.value);
    if (!rawSigner) throw new Error("Signer no disponible");

    const instance = ReverseRegistrar__factory.connect(ADDRESS, rawSigner);
    store.initContract(instance, ADDRESS);
  };

  const getContract = (): ReverseRegistrar => {
    const rawContract = toRaw(contract.value);
    if (!rawContract) throw new Error("ReverseRegistrar no inicializado");
    return rawContract;
  };

  /* METODOS DEL CONTRATO */

  const setName = async (name: string) => {
    return getContract().setName(name);
  };

  const setNameFor = async (targetAddress: string, name: string) => {
    const rawAccount = toRaw(account.value);
    if (!rawAccount) throw new Error("Cuenta no disponible");
    return getContract().setNameFor(targetAddress, rawAccount, name);
  };

  const node = async (address: string) => {
    return getContract().node(address);
  };

  return {
    init,
    contract,
    contractAddress: ADDRESS,
    setName,
    setNameFor,
    node,
  };
}
