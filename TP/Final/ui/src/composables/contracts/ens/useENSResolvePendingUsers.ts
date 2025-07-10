import { storeToRefs } from "pinia";
import { useUserStore } from "@/store/usersStore";

import { usePublicResolver } from "@/services/contracts/ens/usePublicResolver";
import { useCallHandler } from "@/composables/contracts/handlers/useCallHandler";
import { namehash } from "@/utils/ens";

/**
 * Composable para resolver nombres ENS a direcciones de cuentas pendientes a autorizar
 */
export function useENSResolvePendingUsers() {
  const userStore = useUserStore();
  const { pendingUsers } = storeToRefs(userStore);
  const { addPendingUser } = userStore;

  const { getAddr } = usePublicResolver();
  const { loading, error, message, runCall } = useCallHandler<void>();

  const resolvePendingUsers = async (): Promise<void> => {
    const unresolved = pendingUsers.value.filter((u) => !u.address);

    if (!unresolved || unresolved.length === 0) {
      return;
    }

    await runCall(async () => {
      for (const user of unresolved) {
        try {
          if (typeof user.name === "string") {
            const nodeHash = namehash(user.name);
            const address = await getAddr(nodeHash);

            addPendingUser({ name: user.name, address });
          } else {
            console.error(`Nombre de usuario inválido:`, user.name);
            addPendingUser({ name: user.name, address: null });
          }
        } catch (e) {
          console.error(`Error resolviendo ${user.name}:`, e);
          addPendingUser({ name: user.name, address: null });
        }
      }
    }, "Resolución de nombres ENS a direcciones completada");
  };

  return {
    resolvePendingUsers,
    loading,
    error,
    message,
    pendingUsers,
  };
}
