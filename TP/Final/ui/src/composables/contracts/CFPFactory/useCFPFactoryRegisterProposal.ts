import { calculateFileHash } from "@/utils/ethersUtils";
import { useCFPFactory } from "../../../services/contracts/business/useCFPFactory";
import { useTxHandler } from "../handlers/useTxHandler";

/**
 * Composable para registrar on-chain una propuesta en CFPFactory usando cuenta Metamask
 */
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
      "Propuesta registrada en la blockchain",
      undefined, // onSuccess
      (err: any) => {
        // Manejar error específico de propuesta duplicada
        if (err?.message?.includes("missing revert data") || 
            err?.message?.includes("CALL_EXCEPTION")) {
          error.value = "La propuesta ya ha sido registrada anteriormente.";
          message.value = "La propuesta ya ha sido registrada anteriormente.";
        }
      }
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
