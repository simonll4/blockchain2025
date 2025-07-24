import { toRaw } from "vue";
import { storeToRefs } from "pinia";

import { useMetamask } from "@/services/metamask/useMetamask";
import { UsuariosRegistrar__factory } from "@/services/contracts/types/factories/UsuariosRegistrar__factory";
import { useUsuariosRegistrarStore } from "@/store/contracts/ens/UsuariosRegistrarStore";
import type { UsuariosRegistrar } from "../types";
import contractsConfig from "../../../../contractsConfig.json";

const ADDRESS = contractsConfig.contracts.usuariosRegistrar;

/**
 * Composable para interactuar con el contrato UsuariosRegistrar.
 */
export function useUsuariosRegistrar() {
  const { signer, account } = useMetamask();
  const store = useUsuariosRegistrarStore();
  const { contract } = storeToRefs(store);

  const init = async () => {
    const rawSigner = toRaw(signer.value);
    if (!rawSigner) throw new Error("Signer no disponible");
    const instance = UsuariosRegistrar__factory.connect(ADDRESS, rawSigner);
    store.initContract(instance);
  };

  const getContract = (): UsuariosRegistrar => {
    const rawContract = toRaw(contract.value);
    if (!rawContract) throw new Error("UsuariosRegistrar no inicializado");
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
    contractAddress: ADDRESS,
  };
}
