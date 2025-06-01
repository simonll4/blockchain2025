// src/composables/useIsAuthorized.ts
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useCFPFactory } from "./useCFPFactory";
import { useUserStore } from "@/store/user";

export function useIsAuthorized() {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const { isAuthorized: checkAuthorization } = useCFPFactory();
  const userStore = useUserStore();
  const { address, isAuthorized } = storeToRefs(userStore);

  const checkIsAuthorized = async () => {
    if (!address.value) {
      error.value = "Dirección de usuario no disponible";
      userStore.setAuthorized(false);
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const result = await checkAuthorization(address.value);
      userStore.setAuthorized(result);
      console.log("Autorización verificada:", result);
    } catch (err: any) {
      console.error("Error verificando autorización:", err);
      error.value = err.message || "Error desconocido";
      userStore.setAuthorized(false);
    } finally {
      loading.value = false;
    }
  };

  watch(
    address,
    () => {
      checkIsAuthorized();
    },
    { immediate: true }
  );

  return {
    isAuthorized,
    loading,
    error,
    checkIsAuthorized,
  };
}
