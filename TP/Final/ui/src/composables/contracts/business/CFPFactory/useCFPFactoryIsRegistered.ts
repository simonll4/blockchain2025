import { watch } from "vue";
import { storeToRefs } from "pinia";

import { useCFPFactory } from "@/services/contracts/business/useCFPFactory";
import { useUserStore } from "@/store/userStore";
import { useCallHandler } from "@/composables/contracts/handlers/useCallHandler";


/**
 * Composable para verificar on-chain si un usuario está registrado en CFPFactory usando cuenta Metamask
 */
export function useCFPFactoryIsRegistered() {
  const { isRegistered } = useCFPFactory();
  const userStore = useUserStore();
  const { address, isPending } = storeToRefs(userStore);
  const { loading, error, message, runCall } = useCallHandler<boolean>();

  const checkIsRegistered = async () => {
    if (!address.value) {
      error.value = "Dirección de usuario no disponible";
      message.value = null;
      userStore.setPending(false);
      return;
    }

    await runCall(
      () => isRegistered(address.value),
      "Verificación de registro completada correctamente",
      (result) => userStore.setPending(result),
      (err) => {
        const msg = err.message || "Error desconocido al verificar el registro";
        error.value = msg;
        message.value = msg;
        userStore.setPending(false);
      }
    );
  };

  watch(address, checkIsRegistered, { immediate: true });

  return {
    isPending,
    loading,
    error,
    message,
    checkIsRegistered,
  };
}
