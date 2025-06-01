import { calculateFileHash } from "@/utils/ethersUtils";
import { useCFPFactory } from "./useCFPFactory";
import { useTxHandler } from "./useTxHandler";
import { ethers } from "ethers";



export function useCreateCall() {
  const { createCall } = useCFPFactory();
  const { isLoading, error, success, message, execute } = useTxHandler();

  const create = async (callId: string, timestamp: number) => {
    if (!callId) throw new Error("El ID del llamado es obligatorio");
    if (!timestamp || timestamp <= 0)
      throw new Error("El timestamp debe ser un número positivo");

    // Validación simple del formato (debe empezar con 0x)
    if (!callId.startsWith("0x")) {
      throw new Error("El ID debe comenzar con '0x'");
    }

    await execute(
      () => createCall(callId, timestamp),
      "Llamado creado correctamente"
    );
  };

  return {
    isLoading,
    error,
    success,
    message,
    create,
  };
}
