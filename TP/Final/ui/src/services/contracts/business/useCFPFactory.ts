import { toRaw } from "vue";
import { storeToRefs } from "pinia";

import { useMetamask } from "../../metamask/useMetamask";
import { CFPFactory__factory } from "@/services/contracts/types/factories/CFPFactory__factory";
import { useCFPFactoryStore } from "@/store/contracts/business/CFPFactoryStore";
import type { CFPFactory } from "../types";
import contractsConfig from "../../../../contractsConfig.json";

const ADDRESS = contractsConfig.contracts.cfpFactory;

/**
 * Composable para interactuar con el contrato CFPFactory.
 */
export function useCFPFactory() {
  const contractStore = useCFPFactoryStore();
  const { contract } = storeToRefs(contractStore);
  const { signer } = useMetamask();

  // Inicializar el contrato CFPFactory
  const init = async () => {
    const rawSigner = toRaw(signer.value);
    if (!rawSigner) throw new Error("Signer no disponible");
    const instance = CFPFactory__factory.connect(ADDRESS, rawSigner);
    contractStore.initContract(instance, ADDRESS);
  };

  const getContract = (): CFPFactory => {
    const rawContract = toRaw(contract.value);
    if (!rawContract) throw new Error("CFPFactory no inicializado");
    return rawContract;
  };

  /* METODOS DEL CONTRATO */

  const getOwner = async () => {
    return getContract().owner();
  };

  const getCall = async (callId: string) => {
    return getContract().calls(callId);
  };

  // Crear un nuevo llamado
  const createCall = async (callId: string, timestamp: number) => {
    return getContract().create(callId, timestamp);
  };

  // Registrar una propuesta en un llamado
  const registerProposal = async (callId: string, proposal: string) => {
    return getContract().registerProposal(callId, proposal);
  };

  // Verificar si una dirección está autorizada para crear llamdos
  const isAuthorized = async (address: string) => {
    return getContract().isAuthorized(address);
  };

  // Verificar si una dirección está registrada en el contrato para crear llamados
  const isRegistered = async (address: string): Promise<boolean> => {
    return getContract().isRegistered(address);
  };

  // Registrarse en el contrato para poder crear llamados
  const register = async () => {
    return getContract().register();
  };

  // Autorizar a una cuenta para crear llamados
  const authorize = async (creator: string) => {
    return getContract().authorize(creator);
  };

  return {
    init,
    getOwner,
    getCall,
    createCall,
    registerProposal,
    register,
    isAuthorized,
    isRegistered,
    authorize,
    contract,
  };
}
