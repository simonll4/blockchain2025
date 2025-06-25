import { Contract } from "ethers";
import { toRaw } from "vue";
import { storeToRefs } from "pinia";
import { useENSStore } from "@/store/ens/useENSStore";
import { useMetamask } from "@/services/metamask/useMetamask";
import LlamadosRegistrarArtifact from "../../../../../contracts/build/contracts/LlamadosRegistrar.json";

const ABI = LlamadosRegistrarArtifact.abi;
const NETWORKS = LlamadosRegistrarArtifact.networks;
const NETWORK_ID = import.meta.env.VITE_NETWORK_ID as keyof typeof NETWORKS;

export function useLlamadosRegistrar() {
  const ensStore = useENSStore();
  const { llamadosRegistrar } = storeToRefs(ensStore);
  const { setLlamadosRegistrar } = ensStore;
  const { signer } = useMetamask();
  const address = NETWORKS[NETWORK_ID]?.address;
  if (!address) throw new Error("Dirección LlamadosRegistrar no encontrada");
  const rawSigner = toRaw(signer.value);
  if (!rawSigner) throw new Error("Signer no disponible");

  if (!llamadosRegistrar.value) {
    const instance = new Contract(address, ABI, rawSigner);
    setLlamadosRegistrar(instance);
  }

  const register = async (llamadoName: string) => {
    if (!llamadosRegistrar.value)
      throw new Error("Contrato LlamadosRegistrar no inicializado");
    return llamadosRegistrar.value.register(llamadoName);
  };

  return { register, contract: llamadosRegistrar };
}
