import { toRaw } from "vue";
import { storeToRefs } from "pinia";

import { useMetamask } from "@/services/metamask/useMetamask";
import { useENSRegistryStore } from "@/store/contracts/ens/ENSRegistryStore";
import { ENSRegistry__factory } from "@/services/contracts/types/factories/ENSRegistry__factory";
import type { ENSRegistry } from "@/services/contracts/types/ENSRegistry";

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
    return getContract().setSubnodeOwner(node, label, owner);
  };

  /**
   * Cambia el owner de un nodo existente
   */
  const setOwner = async (node: string, newOwner: string) => {
    return getContract().setOwner(node, newOwner);
  };

  /**
   * Asigna un nuevo resolver a un nodo
   */
  const setResolver = async (node: string, resolverAddress: string) => {
    return getContract().setResolver(node, resolverAddress);
  };

  /**
   * Asigna un nuevo TTL a un nodo
   */
  const setTTL = async (node: string, ttl: number) => {
    return getContract().setTTL(node, ttl);
  };

  /**
   * Obtiene el TTL de un nodo
   */
  const getTTL = async (node: string): Promise<bigint> => {
    return await getContract().ttl(node);
  };

  /**
   * Devuelve el address del resolver de un nodo
   */
  const getResolver = async (node: string): Promise<string> => {
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