import { toRaw } from "vue";
import { storeToRefs } from "pinia";

import { useMetamask } from "@/services/metamask/useMetamask";
import { useLlamadosRegistrarStore } from "@/store/contracts/ens/LlamadosRegistrarStore";
import { LlamadosRegistrar__factory } from "@/services/contracts/types/factories/LlamadosRegistrar__factory";
import type { LlamadosRegistrar } from "../types";
import contractsConfig from "../../../../contractsConfig.json";

const ADDRESS = contractsConfig.contracts.llamadosRegistrar;

/**
 * Composable para interactuar con el contrato LlamadosRegistrar.
 */
export function useLlamadosRegistrar() {
  const { signer, account } = useMetamask();
  const store = useLlamadosRegistrarStore();
  const { contract } = storeToRefs(store);

  const init = async () => {
    const rawSigner = toRaw(signer.value);
    if (!rawSigner) throw new Error("Signer no disponible");

    const instance = LlamadosRegistrar__factory.connect(ADDRESS, rawSigner);
    const address = await instance.getAddress();

    store.initContract(instance, address);
  };

  const getContract = (): LlamadosRegistrar => {
    const rawContract = toRaw(contract.value);
    if (!rawContract) throw new Error("CFPFactory no inicializado");
    return rawContract;
  };

  /* METODOS DEL CONTRATO */

  const register = async (labelHash: string) => {
    const rawAccount = toRaw(account.value);
    if (!rawAccount) throw new Error("Cuenta no disponible");
    return getContract().register(labelHash, rawAccount);
  };

  return {
    init,
    register,
    contract,
    contractAddress: contract.value?.target,
  };
}
