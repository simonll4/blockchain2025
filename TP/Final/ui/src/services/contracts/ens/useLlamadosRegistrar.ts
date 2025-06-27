import { toRaw } from "vue";
import { storeToRefs } from "pinia";
import { useMetamask } from "@/services/metamask/useMetamask";
import { useLlamadosRegistrarStore } from "@/store/contracts/ens/LlamadosRegistrarStore";
import { LlamadosRegistrar__factory } from "@/services/contracts/types/factories/LlamadosRegistrar__factory";
import { labelhash } from "@/utils/ens";

const ADDRESS = import.meta.env.VITE_LLAMADOS_REGISTRAR_ADDRESS;

export function useLlamadosRegistrar() {
  const { signer, account } = useMetamask();
  const store = useLlamadosRegistrarStore();
  const { contract, contractAddress } = storeToRefs(store);

  const init = async () => {
    const rawSigner = toRaw(signer.value);
    if (!rawSigner) throw new Error("Signer no disponible");

    const instance = LlamadosRegistrar__factory.connect(ADDRESS, rawSigner);
    const address = await instance.getAddress();

    store.initContract(instance, address);
  };

  const register = async (label: string) => {
    const rawContract = toRaw(contract.value);
    const rawAccount = toRaw(account.value);
    if (!rawContract)
      throw new Error("Contrato LlamadosRegistrar no inicializado");
    if (!rawAccount) throw new Error("Cuenta no disponible");
    const hashedLabel = labelhash(label);
    console.log("aca",rawAccount)
    return rawContract.register(hashedLabel, rawAccount);
  };

  return {
    init,
    register,
    contract,
    contractAddress,
  };
}
