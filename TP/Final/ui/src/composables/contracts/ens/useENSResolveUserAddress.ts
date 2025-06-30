import { storeToRefs } from "pinia";
import { useUserStore } from "@/store/userStore";

import { useReverseRegistrar } from "@/services/contracts/ens/useReverseRegistrar";
import { usePublicResolver } from "@/services/contracts/ens/usePublicResolver";
import { useCallHandler } from "@/composables/contracts/handlers/useCallHandler";

/**
 * Composable para resolver una dirección Ethereum a un nombre ENS
 */
export function useENSResolveUserAddress() {
  const { node } = useReverseRegistrar();
  const { getName } = usePublicResolver();

  const userStore = useUserStore();
  const { setENSName } = userStore;
  const { ensName } = storeToRefs(userStore);

  const { loading, error, message, result, runCall } = useCallHandler<
    string | null
  >();

  const resolveAddress = async (address: string): Promise<string | null> => {
    if (!address) throw new Error("Dirección no especificada");

    return runCall(async () => {
      const nodeHash = await node(address);
      const resolvedName = await getName(nodeHash);
      const name = resolvedName;

      setENSName(name);
      return name;
    }, "Nombre ENS resuelto correctamente");
  };

  return {
    resolveAddress,
    loading,
    error,
    message,
    result,
    ensName,
  };
}
