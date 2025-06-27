import { toRaw } from "vue";
import { storeToRefs } from "pinia";

import { useMetamask } from "@/services/metamask/useMetamask";
import { useReverseRegistrarStore } from "@/store/contracts/ens/ReverseRegistrarStore";
import { ReverseRegistrar__factory } from "@/services/contracts/types/factories/ReverseRegistrar__factory";
import type { ReverseRegistrar } from "../types";

const ADDR_REVERSE_NODE = import.meta.env.VITE_ADDR_REVERSE_NODE;
const ADDRESS = import.meta.env.VITE_REVERSE_REGISTRAR_ADDRESS;

export function useReverseRegistrar() {
  const store = useReverseRegistrarStore();
  const { contract, contractAddress } = storeToRefs(store);
  const { signer, account } = useMetamask();

  const init = async () => {
    const rawSigner = toRaw(signer.value);
    if (!rawSigner) throw new Error("Signer no disponible");

    const instance = ReverseRegistrar__factory.connect(ADDRESS, rawSigner);
    store.initContract(instance, ADDRESS);
  };

  const getContract = (): ReverseRegistrar => {
    if (!contract.value) {
      throw new Error("ReverseRegistrar no inicializado");
    }
    return toRaw(contract.value);
  };

  const setName = async (name: string) => {
    return getContract().setName(name);
  };

  const setNameFor = async (
    targetAddress: string,
    name: string
  ) => {
    const rawContract = toRaw(contract.value);
    const rawAccount = toRaw(account.value);
    if (!rawContract) throw new Error("ReverseRegistrar no inicializado");
    return rawContract.setNameFor(
      targetAddress,
      rawAccount,
      name
    );
  };

  const claim = async (owner: string) => {
    return getContract().claim(owner);
  };

  const claimWithResolver = async (owner: string, resolver: string) => {
    return getContract().claimWithResolver(owner, resolver);
  };

  const node = async (address: string) => {
    return getContract().node(address);
  };

  return {
    init,
    contract,
    contractAddress,
    ADDR_REVERSE_NODE,
    setName,
    setNameFor,
    claim,
    claimWithResolver,
    node,
  };
}

// import { Contract } from "ethers";
// import { toRaw } from "vue";
// import { storeToRefs } from "pinia";
// import { useENSStore } from "@/store/ens/useENSStore";
// import { useMetamask } from "@/services/metamask/useMetamask";
// import ReverseRegistrarArtifact from "../../../../../contracts/build/contracts/ReverseRegistrar.json";

// const ABI = ReverseRegistrarArtifact.abi;
// const NETWORKS = ReverseRegistrarArtifact.networks;
// const NETWORK_ID = import.meta.env.VITE_NETWORK_ID as keyof typeof NETWORKS;

// // namehash('addr.reverse') = constante del contrato
// export const ADDR_REVERSE_NODE =
//   "0x91d1777781884d03a6757a803996e38de2a42967fb37eeaca72729271025a9e2";

// export function useReverseRegistrar() {
//   const ensStore = useENSStore();
//   const { reverseRegistrar } = storeToRefs(ensStore);
//   const { setReverseRegistrar } = ensStore;
//   const { signer } = useMetamask();

//   if (!NETWORK_ID) {
//     throw new Error("VITE_NETWORK_ID no está definido en las variables de entorno");
//   }

//   const address = NETWORKS[NETWORK_ID]?.address;
//   if (!address) {
//     throw new Error(`Dirección ReverseRegistrar no encontrada para la red ${NETWORK_ID}. Redes disponibles: ${Object.keys(NETWORKS).join(', ')}`);
//   }

//   const rawSigner = toRaw(signer.value);
//   if (!rawSigner) throw new Error("Signer no disponible");

//   if (!reverseRegistrar.value) {
//     const instance = new Contract(address, ABI, rawSigner);
//     setReverseRegistrar(instance);
//   }

//   // FUNCIONES DISPONIBLES EN EL CONTRATO

//   const setName = async (name: string) => {
//     if (!reverseRegistrar.value)
//       throw new Error("ReverseRegistrar no inicializado");
//     return reverseRegistrar.value.setName(name);
//   };

//   const claim = async (owner: string) => {
//     if (!reverseRegistrar.value)
//       throw new Error("ReverseRegistrar no inicializado");
//     return reverseRegistrar.value.claim(owner);
//   };

//   const claimWithResolver = async (owner: string, resolver: string) => {
//     if (!reverseRegistrar.value)
//       throw new Error("ReverseRegistrar no inicializado");
//     return reverseRegistrar.value.claimWithResolver(owner, resolver);
//   };

//   const node = async (address: string) => {
//     if (!reverseRegistrar.value)
//       throw new Error("ReverseRegistrar no inicializado");
//     return reverseRegistrar.value.node(address);
//   };

//   return {
//     contract: reverseRegistrar,
//     setName,
//     claim,
//     claimWithResolver,
//     node,
//     ADDR_REVERSE_NODE,
//   };
// }
