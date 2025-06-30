import { watch } from "vue";
import { storeToRefs } from "pinia";

import { useCallHandler } from "../handlers/useCallHandler";
import { useCFPFactory } from "../../../services/contracts/business/useCFPFactory";
import { useUserStore } from "@/store/userStore";

export function useCFPFactoryIsOwner() {
  const { loading, error, message, runCall } = useCallHandler<boolean>();
  const { getOwner } = useCFPFactory();
  const userStore = useUserStore();
  const { address, isOwner } = storeToRefs(userStore);

  const checkIsOwner = async () => {
    if (!address.value) {
      const msg = "Dirección de usuario no disponible";
      error.value = msg;
      message.value = msg;
      userStore.setOwner(false);
      return;
    }

    await runCall(
      async () => {
        const owner = await getOwner();
        return owner.toLowerCase() === address.value.toLowerCase();
      },
      "Verificación de ownership completada correctamente",
      (result) => userStore.setOwner(result),
      (err) => {
        const msg = err.message || "Error desconocido al verificar ownership";
        error.value = msg;
        message.value = msg;
        userStore.setOwner(false);
      }
    );
  };

  watch(address, () => checkIsOwner(), { immediate: true });

  return {
    isOwner,
    loading,
    error,
    message,
    checkIsOwner,
  };
}
