import { ref } from "vue";

export function useTxHandler<T = any>() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const success = ref(false);
  const message = ref<string | null>(null);

  const runTx = async (
    txFn: () => Promise<{ wait: () => Promise<T> }>,
    successMsg: string,
    onSuccess?: (receipt: T) => void,
    onError?: (err: any) => void
  ): Promise<T | null> => {
    isLoading.value = true;
    error.value = null;
    success.value = false;
    message.value = null;

    try {
      const tx = await txFn();
      const receipt = await tx.wait();

      success.value = true;
      message.value = successMsg;
      onSuccess?.(receipt);

      return receipt;
    } catch (err: any) {
      console.error("Error al ejecutar la transacción:", err);
      // const msg = err.message || "Error desconocido";
      const msg = "Error al ejecutar la transacción";
      error.value = msg;
      message.value = msg;
      onError?.(err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    error,
    success,
    message,
    runTx,
  };
}
