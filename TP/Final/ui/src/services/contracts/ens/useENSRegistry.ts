import { toRaw } from "vue";
import { storeToRefs } from "pinia";

import { useMetamask } from "@/services/metamask/useMetamask";
import { useENSRegistryStore } from "@/store/ens/useENSRegistryStore";
import { ENSRegistry__factory } from "@/services/contracts/types/factories/ENSRegistry__factory";
import type { ENSRegistry } from "@/services/contracts/types/ENSRegistry";

// const NETWORKS = await import(
//   "@/../contracts/build/contracts/ENSRegistry.json"
// ).then((mod) => mod.networks);
// const NETWORK_ID = import.meta.env.VITE_NETWORK_ID as keyof typeof NETWORKS;

const ADDRESS = import.meta.env.VITE_ENS_REGISTRY_ADDRESS;

export function useENSRegistry() {
  const store = useENSRegistryStore();
  const { contract, contractAddress } = storeToRefs(store);
  const { signer } = useMetamask();

  const init = async () => {
    // const address = NETWORKS[NETWORK_ID]?.address;
    // if (!address)
    //   throw new Error("Dirección ENSRegistry no encontrada para esta red");

    const rawSigner = toRaw(signer.value);
    if (!rawSigner) throw new Error("Signer no disponible");

    const instance = ENSRegistry__factory.connect(ADDRESS, rawSigner);
    store.initContract(instance, ADDRESS);
  };

  const getContract = (): ENSRegistry => {
    const rawContract = toRaw(contract.value);
    if (!rawContract) throw new Error("ENSRegistry no inicializado");
    return rawContract;
  };

  /**
   * Devuelve el owner actual de un nodo
   */
  const getOwner = async (node: string): Promise<string> => {
    // const rawContract = toRaw(contract.value);
    // if (!rawContract) throw new Error("ENSRegistry no inicializado");
    // return rawContract.owner(node);
    return getContract().owner(node);
  };

  /**
   * Crea un subnodo y le asigna un nuevo owner
   */
  const setSubnodeOwner = async (
    node: string,
    label: string,
    owner: string
  ) => {
    // const rawContract = toRaw(contract.value);
    // if (!rawContract) throw new Error("ENSRegistry no inicializado");
    // return rawContract.setSubnodeOwner(node, label, owner);
    return getContract().setSubnodeOwner(node, label, owner);
  };

  /**
   * Cambia el owner de un nodo existente
   */
  const setOwner = async (node: string, newOwner: string) => {
    // const rawContract = toRaw(contract.value);
    // if (!rawContract) throw new Error("ENSRegistry no inicializado");
    // return rawContract.setOwner(node, newOwner);
    return getContract().setOwner(node, newOwner);
  };

  /**
   * Asigna un nuevo resolver a un nodo
   */
  const setResolver = async (node: string, resolverAddress: string) => {
    // const rawContract = toRaw(contract.value);
    // if (!rawContract) throw new Error("ENSRegistry no inicializado");
    // return rawContract.setResolver(node, resolverAddress);
    return getContract().setResolver(node, resolverAddress);
  };

  /**
   * Asigna un nuevo TTL a un nodo
   */
  const setTTL = async (node: string, ttl: number) => {
    // const rawContract = toRaw(contract.value);
    // if (!rawContract) throw new Error("ENSRegistry no inicializado");
    // return rawContract.setTTL(node, ttl);
    return getContract().setTTL(node, ttl);
  };

  /**
   * Obtiene el TTL de un nodo
   */
  const getTTL = async (node: string): Promise<bigint> => {
    // const rawContract = toRaw(contract.value);
    // if (!rawContract) throw new Error("ENSRegistry no inicializado");
    // return await rawContract.ttl(node);
    return await getContract().ttl(node);
  };

  /**
   * Devuelve el address del resolver de un nodo
   */
  const getResolver = async (node: string): Promise<string> => {
    // const rawContract = toRaw(contract.value);
    // if (!rawContract) throw new Error("ENSRegistry no inicializado");
    // return rawContract.resolver(node);
    return getContract().resolver(node);
  };

  return {
    init,
    contract,
    contractAddress,
    getOwner,
    setSubnodeOwner,
    setOwner,
    setResolver,
    setTTL,
    getTTL,
    getResolver,
  };
}

// import { Contract } from "ethers";
// import { toRaw } from "vue";
// import { storeToRefs } from "pinia";
// import { useENSStore } from "@/store/ens/useENSStore";
// import { useMetamask } from "@/services/metamask/useMetamask";
// import ENSRegistryArtifact from "../../../../../contracts/build/contracts/ENSRegistry.json";

// const ABI = ENSRegistryArtifact.abi;
// const NETWORKS = ENSRegistryArtifact.networks;
// const NETWORK_ID = import.meta.env.VITE_NETWORK_ID as keyof typeof NETWORKS;

// const ADDRESS = import.meta.env.VITE_USUARIOS_REGISTRAR_ADDRESS;

// export function useENSRegistry() {
//   const ensStore = useENSStore();
//   const { registry } = storeToRefs(ensStore);
//   const { setRegistry } = ensStore;
//   const { signer } = useMetamask();
//   const address = NETWORKS[NETWORK_ID]?.address;

//   if (!address) throw new Error("Dirección ENSRegistry no encontrada");
//   console.log("Dirección ENSRegistry:", address);

//   const rawSigner = toRaw(signer.value);
//   if (!rawSigner) throw new Error("Signer no disponible");

//   if (!registry.value) {
//     const instance = new Contract(address, ABI, rawSigner);
//     setRegistry(instance);
//   }

//   /**
//    * Devuelve el owner actual de un nodo
//    */
//   const getOwner = async (node: string): Promise<string> => {
//     if (!registry.value) throw new Error("ENSRegistry no inicializado");
//     return registry.value.owner(node);
//   };

//   /**
//    * Crea un subnodo y le asigna un nuevo owner
//    */
//   const setSubnodeOwner = async (
//     node: string,
//     label: string,
//     owner: string
//   ) => {
//     if (!registry.value) throw new Error("ENSRegistry no inicializado");
//     return registry.value.setSubnodeOwner(node, label, owner);
//   };

//   /**
//    * Cambia el owner de un nodo existente
//    */
//   const setOwner = async (node: string, newOwner: string) => {
//     if (!registry.value) throw new Error("ENSRegistry no inicializado");
//     return registry.value.setOwner(node, newOwner);
//   };

//   /**
//    * Asigna un nuevo resolver a un nodo
//    */
//   const setResolver = async (node: string, resolverAddress: string) => {
//     if (!registry.value) throw new Error("ENSRegistry no inicializado");
//     return registry.value.setResolver(node, resolverAddress);
//   };

//   /**
//    * Asigna un nuevo TTL a un nodo
//    */
//   const setTTL = async (node: string, ttl: number) => {
//     if (!registry.value) throw new Error("ENSRegistry no inicializado");
//     return registry.value.setTTL(node, ttl);
//   };

//   /**
//    * Obtiene el TTL de un nodo
//    */
//   const getTTL = async (node: string): Promise<number> => {
//     if (!registry.value) throw new Error("ENSRegistry no inicializado");
//     return (await registry.value.ttl(node)).toNumber();
//   };

//   /**
//    * Devuelve el address del resolver de un nodo
//    */
//   const getResolver = async (node: string): Promise<string> => {
//     if (!registry.value) throw new Error("ENSRegistry no inicializado");
//     return registry.value.resolver(node);
//   };

//   return {
//     contract: registry,
//     getOwner,
//     setSubnodeOwner,
//     setOwner,
//     setResolver,
//     setTTL,
//     getTTL,
//     getResolver,
//   };
// }

// import { Contract } from "ethers";
// import { toRaw } from "vue";
// import { storeToRefs } from "pinia";
// import { useENSStore } from "@/store/ens/useENSStore";
// import { useMetamask } from "@/services/metamask/useMetamask";
// import ENSRegistryArtifact from "../../../../../contracts/build/contracts/ENSRegistry.json";

// const ABI = ENSRegistryArtifact.abi;
// const NETWORKS = ENSRegistryArtifact.networks;
// const NETWORK_ID = import.meta.env.VITE_NETWORK_ID as keyof typeof NETWORKS;

// export function useENSRegistry() {
//   const ensStore = useENSStore();
//   const { registry } = storeToRefs(ensStore);
//   const { setRegistry } = ensStore;
//   const { signer } = useMetamask();
//   const address = NETWORKS[NETWORK_ID]?.address;
//   if (!address) throw new Error("Dirección ENSRegistry no encontrada");
//   const rawSigner = toRaw(signer.value);
//   if (!rawSigner) throw new Error("Signer no disponible");

//   // Instanciar solo si no existe
//   if (!registry.value) {
//     const instance = new Contract(address, ABI, rawSigner);
//     setRegistry(instance);
//   }

//   const getOwner = async (node: string) => {
//     if (!registry.value)
//       throw new Error("Contrato ENSRegistry no inicializado");
//     return registry.value.owner(node);
//   };
//   const setSubnodeOwner = async (
//     node: string,
//     label: string,
//     owner: string
//   ) => {
//     if (!registry.value)
//       throw new Error("Contrato ENSRegistry no inicializado");
//     return registry.value.setSubnodeOwner(node, label, owner);
//   };
//   // Agrega más funciones según el ABI que necesites
//   return { getOwner, setSubnodeOwner, contract: registry };
// }
