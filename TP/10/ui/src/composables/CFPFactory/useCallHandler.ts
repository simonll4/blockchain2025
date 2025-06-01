import { ref } from "vue";

export function useCallHandler<T = any>() {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const result = ref<T | null>(null);

  const runCall = async (
    callFn: () => Promise<T>,
    onSuccess?: (data: T) => void,
    onError?: (err: any) => void
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const data = await callFn();
      result.value = data;
      onSuccess?.(data);
      return data;
    } catch (err: any) {
      const msg = err.message || "Error desconocido";
      error.value = msg;
      result.value = null;
      onError?.(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    result,
    runCall,
  };
}
