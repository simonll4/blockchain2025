import { Contract } from "ethers";
import { useContractStore } from "@/store/CFPFactory";
import { storeToRefs } from "pinia";
import { useMetamask } from "../useMetamask";
import { toRaw } from "vue";
import factoryArtifact from "../../../../contracts/build/contracts/CFPFactory.json";

const ABI = factoryArtifact.abi;
const NETWORKS = factoryArtifact.networks;
const NETWORK_ID = import.meta.env.VITE_NETWORK_ID as keyof typeof NETWORKS;

export function useCFPFactory() {
  const contractStore = useContractStore();
  const { contract, factoryAddress } = storeToRefs(contractStore);
  const { signer } = useMetamask();

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

    contractStore.setContract(instance);
  };

  const createCall = async (callId: string, timestamp: number) => {
    const rawContract = toRaw(contract.value);
    if (!rawContract) {
      throw new Error("Contrato no inicializado");
    }
    return rawContract.create(callId, timestamp);
  };

  const registerProposal = async (callId: string, proposal: string) => {
    const rawContract = toRaw(contract.value);
    if (!rawContract) {
      throw new Error("Contrato no inicializado");
    }
    return rawContract.registerProposal(callId, proposal);
  };

  const isAuthorized = async (address: string) => {
    const rawContract = toRaw(contract.value);
    if (!rawContract) {
      throw new Error("Contrato no inicializado");
    }
    return rawContract.isAuthorized(address);
  };

  const isRegistered = async (address: string): Promise<boolean> => {
    const rawContract = toRaw(contract.value);
    if (!rawContract) {
      throw new Error("Contrato no inicializado");
    }
    return rawContract.isRegistered(address);
  };

  const register = async () => {
    const rawContract = toRaw(contract.value);
    if (!rawContract) {
      throw new Error("Contrato no inicializado");
    }
    return rawContract.register();
  };

  //TODO proposaldata es una funcion de CFP no de la factory
  const checkProposalExists = async (proposal: string): Promise<boolean> => {
    const rawContract = toRaw(contract.value);
    if (!rawContract) throw new Error("Contrato no inicializado");
    const data = await rawContract.proposalData(proposal);
    return data[0] !== "0x0000000000000000000000000000000000000000";
  };

  const authorize = async (creator: string) => {
    const rawContract = toRaw(contract.value);
    if (!rawContract) {
      throw new Error("Contrato no inicializado");
    }
    // Ejecuta la función authorize del contrato con la dirección a autorizar
    return rawContract.authorize(creator);
  };

  return {
    init,
    createCall,
    registerProposal,
    register,
    checkProposalExists,
    isAuthorized,
    isRegistered,
    authorize,
    contract,
  };
}
