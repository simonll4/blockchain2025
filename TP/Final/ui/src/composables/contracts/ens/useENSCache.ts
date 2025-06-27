// composables/useENSCache.ts
import { useENSResolveCreator } from "@/composables/contracts/ens/useENSResolveCreator";

const ensCache = new Map<string, string>();

export function useENSCache() {
  const { resolveCreator } = useENSResolveCreator();

  const resolveWithCache = async (address: string): Promise<string> => {
    if (ensCache.has(address)) {
      return ensCache.get(address)!;
    }

    try {
      const name = await resolveCreator(address);
      const finalName = name?.trim() || address;
      ensCache.set(address, finalName);
      return finalName;
    } catch (err) {
      console.error("Error resolviendo ENS:", err);
      return address;
    }
  };

  return { resolveWithCache };
}
