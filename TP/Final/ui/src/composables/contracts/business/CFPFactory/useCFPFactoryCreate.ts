import { useCFPFactory } from "../../../../services/contracts/business/useCFPFactory";
import { useTxHandler } from "../../handlers/useTxHandler";

/**
 * Composable para crear un llamado en CFPFactory usando cuenta Metamask
 */
export function useCFPFactoryCreate() {
  const { createCall } = useCFPFactory();
  const { isLoading, error, success, message, runTx } = useTxHandler();

  const create = async (callId: string, timestamp: number) => {
    if (!/^0x[0-9a-fA-F]{64}$/.test(callId)) {
      throw new Error("El callId no es un hash válido de 32 bytes");
    }

    await runTx(() => createCall(callId, timestamp), "Llamado creado");
  };

  return {
    isLoading,
    error,
    success,
    message,
    create,
  };
}
