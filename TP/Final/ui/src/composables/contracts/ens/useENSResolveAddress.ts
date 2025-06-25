import { useReverseRegistrar } from "@/services/contracts/ens/useReverseRegistrar";
import { usePublicResolver } from "@/services/contracts/ens/usePublicResolver";

/**
 * Composable para resolver una dirección Ethereum a un nombre ENS
 */
export function useENSResolveAddress() {
  const { node } = useReverseRegistrar();
  const { getName } = usePublicResolver();

  const resolveAddress = async (address: string): Promise<string | null> => {
    if (!address) throw new Error("Dirección no especificada");

    // 1. Obtener el node hash para resolución inversa
    const nodeHash = await node(address);

    // 2. Leer el nombre asociado al nodo desde el resolver
    const resolvedName = await getName(nodeHash);
    if (!resolvedName || resolvedName === "") return null;

    return resolvedName;
  };

  return {
    resolveAddress,
  };
}
