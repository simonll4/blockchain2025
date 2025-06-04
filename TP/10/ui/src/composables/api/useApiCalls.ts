import { onMounted } from "vue";
import { storeToRefs } from "pinia";

import { CallsService } from "@/services/api/apiClient";
import { useCallsStore } from "@/store/calls";

export function useApiCalls() {
  const store = useCallsStore();
  const { calls, isLoading, error } = storeToRefs(store);

  const fetchCalls = async () => {
    store.setLoading(true);
    try {
      const { data } = await CallsService.getAll();
      store.setCalls(data);
      store.setError(null);
    } catch (err: any) {
      store.setError("Error al cargar los llamados");
      //console.error(err);
    } finally {
      store.setLoading(false);
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
