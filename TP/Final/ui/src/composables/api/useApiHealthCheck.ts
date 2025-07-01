import { ref } from "vue";
import { api } from "@/services/api/apiClient";

/**
 * Composable para verificar la salud de la API.
 */
export function useApiHealthCheck(autoCheck = true) {
  const isHealthy = ref<boolean | null>(null);
  const isChecking = ref(false);

  const checkHealth = async () => {
    isChecking.value = true;
    try {
      await api.checkHealth();
      isHealthy.value = true;
    } catch {
      isHealthy.value = false;
    } finally {
      isChecking.value = false;
    }
  };

  if (autoCheck) checkHealth();

  return { isHealthy, isChecking, checkHealth };
}
