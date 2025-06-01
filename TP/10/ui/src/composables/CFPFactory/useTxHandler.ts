// src/composables/useTxHandler.ts
import { ref } from "vue";

export function useTxHandler() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const success = ref(false);
  const message = ref<string | null>(null);

  const execute = async (txFn: () => Promise<any>, successMessage: string) => {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await txFn();
      message.value = successMessage;
      success.value = true;
      return result;
    } catch (err) {
      console.error("Error completo en execute:", err);

      // Manejo específico de errores de RPC
      if (
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        typeof (err as any).message === "string" &&
        (err as any).message.includes("Internal JSON-RPC")
      ) {
        error.value = `
        Error de conexión con MetaMask:
        1. Recarga la página (F5)
        2. Verifica que MetaMask esté conectado
        3. Revisa que estés en la red correcta
      `;
      } else {
        error.value =
          typeof err === "object" &&
          err !== null &&
          "reason" in err &&
          typeof (err as any).reason === "string"
            ? (err as any).reason
            : typeof err === "object" &&
              err !== null &&
              "message" in err &&
              typeof (err as any).message === "string"
            ? (err as any).message
            : "Error desconocido";
      }

      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  // const execute = async (txFn: () => Promise<any>, successMsg: string) => {
  //   isLoading.value = true;
  //   error.value = null;
  //   success.value = false;
  //   message.value = null;

  //   try {
  //     const tx = await txFn();
  //     const receipt = await tx.wait();
  //     console.log("Tx confirmada:", receipt.hash);
  //     success.value = true;
  //     message.value = successMsg;
  //   } catch (err: any) {
  //     console.error("Error en transacción:", err);
  //     error.value = err.message || "Error desconocido";
  //     message.value = error.value;
  //   } finally {
  //     isLoading.value = false;
  //   }
  // };

  return { isLoading, error, success, message, execute };
}
