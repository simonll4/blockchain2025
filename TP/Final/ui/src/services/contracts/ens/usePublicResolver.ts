// src/services/contracts/usePublicResolver.ts
import { toRaw } from "vue";
import { storeToRefs } from "pinia";

import { useMetamask } from "@/services/metamask/useMetamask";
import { usePublicResolverStore } from "@/store/ens/usePublicResolverStore";
import { PublicResolver__factory } from "@/services/contracts/types/factories/PublicResolver__factory";
import type { PublicResolver } from "@/services/contracts/types/PublicResolver";

const ADDRESS = import.meta.env.VITE_PUBLIC_RESOLVER_ADDRESS;

export function usePublicResolver() {
  const store = usePublicResolverStore();
  const { contract, contractAddress } = storeToRefs(store);
  const { signer } = useMetamask();

  const init = async () => {
    const rawSigner = toRaw(signer.value);
    if (!rawSigner) throw new Error("Signer no disponible");

    const instance = PublicResolver__factory.connect(ADDRESS, rawSigner);
    store.initContract(instance, ADDRESS);
  };

  const getContract = (): PublicResolver => {
    const rawContract = toRaw(contract.value);
    if (!rawContract) throw new Error("PublicResolver no inicializado");
    return rawContract;
  };

  const getAddr = async (node: string): Promise<string> => {
    return getContract().addr(node);
  };

  const setAddr = async (node: string, addr: string) => {
    return getContract().setAddr(node, addr);
  };

  const getName = async (node: string): Promise<string> => {
    return getContract().name(node);
  };

  const setName = async (node: string, name: string) => {
    return getContract().setName(node, name);
  };

  const getText = async (node: string, key: string): Promise<string> => {
    return getContract().text(node, key);
  };

  const setText = async (node: string, key: string, value: string) => {
    return getContract().setText(node, key, value);
  };

  const supportsInterface = async (interfaceId: string): Promise<boolean> => {
    return getContract().supportsInterface(interfaceId);
  };

  return {
    init,
    contract,
    contractAddress,
    getAddr,
    setAddr,
    getName,
    setName,
    getText,
    setText,
    supportsInterface,
  };
}

// import { Contract } from "ethers";
// import { toRaw } from "vue";
// import { storeToRefs } from "pinia";
// import { useENSStore } from "@/store/ens/useENSStore";
// import { useMetamask } from "@/services/metamask/useMetamask";
// import PublicResolverArtifact from "../../../../../contracts/build/contracts/PublicResolver.json";

// const ABI = PublicResolverArtifact.abi;
// const NETWORKS = PublicResolverArtifact.networks;
// const NETWORK_ID = import.meta.env.VITE_NETWORK_ID as keyof typeof NETWORKS;

// export function usePublicResolver() {
//   const ensStore = useENSStore();
//   const { resolver , resolverAddress } = storeToRefs(ensStore);
//   const { setResolver,setResolverAddress } = ensStore;
//   const { signer } = useMetamask();

//   if (!NETWORK_ID) {
//     throw new Error(
//       "VITE_NETWORK_ID no está definido en las variables de entorno"
//     );
//   }

//   const address = NETWORKS[NETWORK_ID]?.address;
//   if (!address) {
//     throw new Error(
//       `Dirección PublicResolver no encontrada para la red ${NETWORK_ID}. Redes disponibles: ${Object.keys(
//         NETWORKS
//       ).join(", ")}`
//     );
//   }

//   const rawSigner = toRaw(signer.value);
//   if (!rawSigner) throw new Error("Signer no disponible");

//   if (!resolver.value) {
//     const instance = new Contract(address, ABI, rawSigner);
//     setResolver(instance);
//     setResolverAddress(address);
//   }

//   // FUNCIONES BÁSICAS

//   const getAddr = async (node: string) => {
//     if (!resolver.value)
//       throw new Error("Contrato PublicResolver no inicializado");
//     return resolver.value.addr(node);
//   };

//   const setAddr = async (node: string, addr: string) => {
//     if (!resolver.value)
//       throw new Error("Contrato PublicResolver no inicializado");
//     return resolver.value.setAddr(node, addr);
//   };

//   const getName = async (node: string) => {
//     if (!resolver.value)
//       throw new Error("Contrato PublicResolver no inicializado");
//     return resolver.value.name(node);
//   };

//   const setName = async (node: string, name: string) => {
//     if (!resolver.value)
//       throw new Error("Contrato PublicResolver no inicializado");
//     return resolver.value.setName(node, name);
//   };

//   const getText = async (node: string, key: string) => {
//     if (!resolver.value)
//       throw new Error("Contrato PublicResolver no inicializado");
//     return resolver.value.text(node, key);
//   };

//   const setText = async (node: string, key: string, value: string) => {
//     if (!resolver.value)
//       throw new Error("Contrato PublicResolver no inicializado");
//     return resolver.value.setText(node, key, value);
//   };

//   const supportsInterface = async (interfaceId: string) => {
//     if (!resolver.value)
//       throw new Error("Contrato PublicResolver no inicializado");
//     return resolver.value.supportsInterface(interfaceId);
//   };

//   return {
//     contract: resolver,
//     address: resolverAddress,
//     getAddr,
//     setAddr,
//     getName,
//     setName,
//     getText,
//     setText,
//     supportsInterface,
//   };
// }
