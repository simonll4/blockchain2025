import { ref } from "vue";

export function useCallHandler<T = any>() {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const result = ref<T | null>(null);
  const message = ref<string | null>(null);

  const runCall = async (
    callFn: () => Promise<T>,
    successMsg?: string,
    onSuccess?: (data: T) => void,
    onError?: (err: any) => void
  ): Promise<T> => {
    loading.value = true;
    error.value = null;
    message.value = null;

    try {
      const data = await callFn();
      result.value = data;

      if (successMsg) {
        message.value = successMsg;
      }

      onSuccess?.(data);
      return data;
    } catch (err: any) {
      //const msg = err.message || "Error desconocido";
      const msg = "Error al ejecutar la transacción";
      error.value = msg;
      message.value = msg;
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
    message,
    result,
    runCall,
  };
}