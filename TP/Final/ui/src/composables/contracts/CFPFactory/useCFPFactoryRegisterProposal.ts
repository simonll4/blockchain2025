import { calculateFileHash } from "@/utils/ethersUtils";
import { useCFPFactory } from "../../../services/contracts/useCFPFactory";
import { useTxHandler } from "../useTxHandler";

export function useCFPFactoryRegisterProposal(callId: string) {
  const { registerProposal } = useCFPFactory();
  const { isLoading, error, success, message, runTx } = useTxHandler();

  const register = async (file: File) => {
    var hash: string;
    try {
      hash = await calculateFileHash(file);
    } catch (err) {
      error.value = "Error al calcular el hash del archivo";
      message.value = "Hubo un error, inténtalo de nuevo";
      throw new Error("Failed to calculate file hash");
    }

    return await runTx(
      () => registerProposal(callId, hash),
      "Propuesta registrada en la blockchain"
    );
  };

  return {
    isLoading,
    error,
    success,
    message,
    register,
  };
}
