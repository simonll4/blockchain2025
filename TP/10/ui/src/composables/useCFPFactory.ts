// src/composables/useFactory.ts
import { storeToRefs } from 'pinia'
import { ethers } from 'ethers'
import { useContractStore } from '@/store/contract'

export function useFactory() {
  const contractStore = useContractStore()
  const { contract } = storeToRefs(contractStore)

  const createCall = async (callId: string, timestamp: number) => {
    if (!contract.value) throw new Error('Contrato no inicializado')
    const tx = await contract.value.create(
      ethers.encodeBytes32String(callId),
      timestamp
    )
    await tx.wait()
  }

  const registerProposal = async (callId: string, proposal: string) => {
    if (!contract.value) throw new Error('Contrato no inicializado')
    const tx = await contract.value.registerProposal(
      ethers.encodeBytes32String(callId),
      ethers.encodeBytes32String(proposal)
    )
    await tx.wait()
  }

  const register = async () => {
    if (!contract.value) throw new Error('Contrato no inicializado')
    const tx = await contract.value.register()
    await tx.wait()
  }

  return {
    createCall,
    registerProposal,
    register,
  }
}






// // src/composables/useFactory.ts
  // import { ref } from "vue";
  // import { ethers } from "ethers";
  // import factoryArtifact from "../../../contracts/build/contracts/CFPFactory.json";
  // import { useMetamask } from "./useMetamask";

  // const ABI = factoryArtifact.abi;
  // const NETWORKS = factoryArtifact.networks;

  // // ⚠️ Asegurate de usar el ID correcto de red
  // const NETWORK_ID = "5777";

  // export function useFactory() {
  //   const { signer } = useMetamask();
  //   const factoryAddress = ref<string>("");

  //   const loadFactory = async () => {
  //     const network = NETWORKS[NETWORK_ID];
  //     if (!network || !network.address) {
  //       throw new Error(
  //         `No se encontró la dirección del contrato para la red ${NETWORK_ID}`
  //       );
  //     }
  //     factoryAddress.value = network.address;
  //   };

  //   const getContract = async () => {
  //     if (!signer.value || !factoryAddress.value)
  //       throw new Error("Signer o address inválido");
  //     return new ethers.Contract(factoryAddress.value, ABI, signer.value);
  //   };

  //   const createCall = async (callId: string, timestamp: number) => {
  //     const contract = await getContract();
  //     const tx = await contract.create(
  //       ethers.encodeBytes32String(callId),
  //       timestamp
  //     );
  //     await tx.wait();
  //   };

  //   const registerProposal = async (callId: string, proposal: string) => {
  //     const contract = await getContract();
  //     const tx = await contract.registerProposal(
  //       ethers.encodeBytes32String(callId),
  //       ethers.encodeBytes32String(proposal)
  //     );
  //     await tx.wait();
  //   };

  //   const register = async () => {
  //     const contract = await getContract();
  //     const tx = await contract.register();
  //     await tx.wait();
  //   };

  //   return {
  //     factoryAddress,
  //     loadFactory,
  //     createCall,
  //     registerProposal,
  //     register,
  //   };
  // }
