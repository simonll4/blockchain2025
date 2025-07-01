import { watch } from "vue";
import { storeToRefs } from "pinia";

import { useCallHandler } from "../handlers/useCallHandler";
import { useCFPFactory } from "../../../services/contracts/business/useCFPFactory";
import { useUserStore } from "@/store/userStore";

/**
 * Composable para verificar on-chain si un usuario está autorizado en CFPFactory usando cuenta Metamask
 */
export function useCFPFactoryIsAuthorized() {
  const { loading, error, message, runCall } = useCallHandler<boolean>();
  const { isAuthorized: checkAuthorization } = useCFPFactory();
  const userStore = useUserStore();
  const { address, isAuthorized } = storeToRefs(userStore);

  const checkIsAuthorized = async () => {
    if (!address.value) {
      const msg = "Dirección de usuario no disponible";
      error.value = msg;
      message.value = msg;
      userStore.setAuthorized(false);
      return;
    }

    await runCall(
      () => checkAuthorization(address.value),
      "Verificación de autorización completada correctamente",
      (result) => userStore.setAuthorized(result),
      (err) => {
        const msg =
          err.message || "Error desconocido al verificar autorización";
        error.value = msg;
        message.value = msg;
        userStore.setAuthorized(false);
      }
    );
  };

  watch(address, () => checkIsAuthorized(), { immediate: true });

  return {
    isAuthorized,
    loading,
    error,
    message,
    checkIsAuthorized,
  };
}
