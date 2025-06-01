import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useCFPFactory } from "./useCFPFactory";
import { useUserStore } from "@/store/user";

export function useIsRegistered() {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const { isRegistered: checkRegistration } = useCFPFactory();
  const userStore = useUserStore();
  const { address, isPending } = storeToRefs(userStore);

  const checkIsRegistered = async () => {
    if (!address.value) {
      error.value = "Dirección de usuario no disponible";
      userStore.setPending(false);
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const result = await checkRegistration(address.value);
      userStore.setPending(result);
      console.log("Registro verificado:", result);
    } catch (err: any) {
      console.error("Error verificando registro:", err);
      error.value = err.message || "Error desconocido";
      userStore.setPending(false);
    } finally {
      loading.value = false;
    }
  };

  watch(
    address,
    () => {
      checkIsRegistered();
    },
    { immediate: true }
  );

  return {
    isPending,
    loading,
    error,
    checkIsRegistered,
  };
}
