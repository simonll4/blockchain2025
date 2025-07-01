import { useCFPFactory } from "@/services/contracts/business/useCFPFactory";
import { useTxHandler } from "../handlers/useTxHandler";

/**
 * Composable para autorizar on-chain una cuenta en CFPFactory usando cuenta Metamask
 */
export function useCFPFactoryAuthorize() {
  const { authorize } = useCFPFactory();
  const { isLoading, error, success, message, runTx } = useTxHandler();

  const authorizeAccount = async (address: string) => {
    if (!address) throw new Error("Dirección inválida");
    await runTx(
      () => authorize(address),
      `Cuenta ${address} autorizada correctamente`
    );
  };

  return {
    isLoading,
    error,
    success,
    message,
    authorizeAccount,
  };
}
