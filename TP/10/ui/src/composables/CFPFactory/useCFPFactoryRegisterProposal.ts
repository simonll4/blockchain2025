import { calculateFileHash } from "@/utils/ethersUtils";
import { useCFPFactory } from "./useCFPFactory";
import { useTxHandler } from "./useTxHandler";

export function useCFPFactoryRegisterProposal(callId: string) {
  const { registerProposal } = useCFPFactory();
  const { isLoading, error, success, message, runTx } = useTxHandler();

  const register = async (file: File) => {
    const hash = await calculateFileHash(file);

    if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) {
      const errMsg = "Hash generado no es válido como bytes32";
      error.value = errMsg;
      message.value = errMsg;
      success.value = false;
      return null;
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
