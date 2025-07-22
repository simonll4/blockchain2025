import { storeToRefs } from "pinia";
import { useUserStore } from "@/store/userStore";

import { useReverseRegistrar } from "@/services/contracts/ens/useReverseRegistrar";
import { usePublicResolver } from "@/services/contracts/ens/usePublicResolver";
import { useCallHandler } from "@/composables/contracts/handlers/useCallHandler";
import { namehash } from "@/utils/ens";

/**
 * Composable para resolver la dirección Ethereum de cuenta Metamask a nombre ENS
 */
export function useENSResolveUserAddress() {
  const { node } = useReverseRegistrar();
  const { getName, getAddr } = usePublicResolver();

  const userStore = useUserStore();
  const { setENSName } = userStore;
  const { ensName } = storeToRefs(userStore);

  const { loading, error, message, result, runCall } = useCallHandler<
    string | null
  >();
  const resolveAddress = async (address: string): Promise<string | null> => {
    if (!address) throw new Error("Dirección no especificada");

    return runCall(async () => {
      // Paso 1: resolución inversa
      const nodeHash = await node(address);
      const reverseName = await getName(nodeHash);
      if (!reverseName) return null;

      // Paso 2: resolución directa
      const directNodeHash = namehash(reverseName);
      const resolvedAddress = await getAddr(directNodeHash);
      if (!resolvedAddress) return null;

      // Paso 3: comparación
      if (resolvedAddress.toLowerCase() !== address.toLowerCase()) {
        console.warn(
          `El nombre ENS ${reverseName} no pertenece realmente a ${address}`
        );
        return null;
      }

      // OK
      setENSName(reverseName);
      return reverseName;
    }, "Nombre ENS validado correctamente");
  };

  // const resolveAddress = async (address: string): Promise<string | null> => {
  //   if (!address) throw new Error("Dirección no especificada");

  //   return runCall(async () => {
  //     const nodeHash = await node(address);
  //     const resolvedName = await getName(nodeHash);
  //     const name = resolvedName;

  //     setENSName(name);
  //     return name;
  //   }, "Nombre ENS resuelto correctamente");
  // };

  return {
    resolveAddress,
    loading,
    error,
    message,
    result,
    ensName,
  };
}
