// composables/useCreators.ts
import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia"; // <-- FALTA ESTO
import { CallsService } from "@/services/apiClient";
import { useCreatorsStore } from "@/store/creators";

export const useCreators = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const store = useCreatorsStore();
  const { creators } = storeToRefs(store); // <-- ASÍ obtenés refs reactivas

  const fetchCreators = async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await CallsService.getCreators();
      store.setCreators(response.data.creators);
    } catch (err: any) {
      error.value = err?.message || "Error al cargar los creadores";
    } finally {
      loading.value = false;
    }
  };

  onMounted(fetchCreators);

  return {
    creators,
    fetchCreators,
    loading,
    error,
  };
};
