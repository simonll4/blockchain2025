import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";

import { CallsService } from "@/services/api/apiClient";
import { useCreatorsStore } from "@/store/creatorsStore";

export const useApiCreators = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const store = useCreatorsStore();
  const { creators } = storeToRefs(store);

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
    loading,
    error,
    fetchCreators,
  };
};
