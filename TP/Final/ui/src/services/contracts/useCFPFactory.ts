import { Contract } from "ethers";
import { toRaw } from "vue";
import { storeToRefs } from "pinia";

import { useCFPFactoryStore } from "@/store/CFPFactory";
import { useMetamask } from "../metamask/useMetamask";

import factoryArtifact from "../../../../contracts/build/contracts/CFPFactory.json";

const ABI = factoryArtifact.abi;
const NETWORKS = factoryArtifact.networks;
const NETWORK_ID = import.meta.env.VITE_NETWORK_ID as keyof typeof NETWORKS;

export function useCFPFactory() {
  const contractStore = useCFPFactoryStore();
  const { contract, factoryAddress } = storeToRefs(contractStore);
  const { signer } = useMetamask();

  // Inicializar el contrato CFPFactory
  const init = async () => {
    const network = NETWORKS[NETWORK_ID];
    if (!network?.address) {
      throw new Error(
        `Dirección de contrato no encontrada para red ${NETWORK_ID}`
      );
    }

    factoryAddress.value = network.address;
    const rawSigner = toRaw(signer.value);
    if (!rawSigner) throw new Error("Signer no disponible");
    const instance = new Contract(factoryAddress.value, ABI, rawSigner);
    //contractStore.setContract(instance);
    contractStore.initContract(instance, factoryAddress.value);
  };

  const getOwner = async () => {
    const rawContract = toRaw(contract.value);
    if (!rawContract) {
      throw new Error("Contrato no inicializado");
    }
    return rawContract.owner();
  };

  // Crear un nuevo llamado
  const createCall = async (callId: string, timestamp: number) => {
    const rawContract = toRaw(contract.value);
    if (!rawContract) {
      throw new Error("Contrato no inicializado");
    }
    return rawContract.create(callId, timestamp);
  };

  // Registrar una propuesta en un llamado
  const registerProposal = async (callId: string, proposal: string) => {
    const rawContract = toRaw(contract.value);
    if (!rawContract) {
      throw new Error("Contrato no inicializado");
    }
    return rawContract.registerProposal(callId, proposal);
  };

  // Verificar si una dirección está autorizada para crear llamdos
  const isAuthorized = async (address: string) => {
    const rawContract = toRaw(contract.value);
    if (!rawContract) {
      throw new Error("Contrato no inicializado");
    }
    return rawContract.isAuthorized(address);
  };

  // Verificar si una dirección está registrada en el contrato para crear llamados
  const isRegistered = async (address: string): Promise<boolean> => {
    const rawContract = toRaw(contract.value);
    if (!rawContract) {
      throw new Error("Contrato no inicializado");
    }
    return rawContract.isRegistered(address);
  };

  // Registrarse en el contrato para poder crear llamados
  const register = async () => {
    const rawContract = toRaw(contract.value);
    if (!rawContract) {
      throw new Error("Contrato no inicializado");
    }
    return rawContract.register();
  };

  // Autorizar a una cuenta para crear llamados
  const authorize = async (creator: string) => {
    const rawContract = toRaw(contract.value);
    if (!rawContract) {
      throw new Error("Contrato no inicializado");
    }
    return rawContract.authorize(creator);
  };

  return {
    init,
    getOwner,
    createCall,
    registerProposal,
    register,
    isAuthorized,
    isRegistered,
    authorize,
    contract,
  };
}
