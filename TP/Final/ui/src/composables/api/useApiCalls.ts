import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";

import { CallsService } from "@/services/api/apiClient";
import { useCallsStore } from "@/store/callsStore";

/**
 * Composable para obtener los llamados desde la API.
 */
export function useApiCalls() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const store = useCallsStore();
  const { calls } = storeToRefs(store);

  const fetchCalls = async () => {
    isLoading.value = true;
    try {
      const { data } = await CallsService.getAll();
      store.setCalls(data);
      error.value = null;
    } catch (err: any) {
      error.value = "Error al cargar los llamados";
      //console.error(err);
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(() => {
    if (calls.value.length === 0) fetchCalls();
  });

  return {
    calls,
    isLoading,
    error,
    fetchCalls,
  };
}