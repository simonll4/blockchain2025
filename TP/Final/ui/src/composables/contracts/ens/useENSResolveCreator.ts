import { useCallDetailStore } from "@/store/callDetailStore";
import { useReverseRegistrar } from "@/services/contracts/ens/useReverseRegistrar";
import { usePublicResolver } from "@/services/contracts/ens/usePublicResolver";
import { useCallHandler } from "@/composables/contracts/useCallHandler";

/**
 * Composable para resolver una dirección Ethereum a un nombre ENS
 * y guardar el resultado en el call.creator del store callDetail.
 */
export function useENSResolveCreator() {
  const { node, contract, init } = useReverseRegistrar();
  const { getName } = usePublicResolver();
  const callDetailStore = useCallDetailStore();

  const { loading, error, message, runCall } = useCallHandler<string | null>();

  const resolveCreator = async (
    creatorAddress: string
  ): Promise<string | null> => {
    if (!contract.value) {
      await init();
    }
    if (!creatorAddress)
      throw new Error("Dirección del creador no especificada");

    return runCall(async () => {
      const nodeHash = await node(creatorAddress);
      const resolvedName = await getName(nodeHash);
      const name = resolvedName ?? creatorAddress; // fallback si no tiene ENS

      if (callDetailStore.call) {
        callDetailStore.call.creator = name;
      }

      return name;
    }, "Nombre ENS del creador resuelto correctamente");
  };

  return {
    resolveCreator,
    loading,
    error,
    message,
  };
}
