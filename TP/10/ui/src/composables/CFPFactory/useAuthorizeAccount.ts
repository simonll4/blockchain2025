import { useCFPFactory } from "./useCFPFactory";
import { useTxHandler } from "./useTxHandler";

export function useAuthorizeAccount() {
  const { authorize } = useCFPFactory();
  const { isLoading, error, success, message, execute } = useTxHandler();

  const authorizeAccount = async (address: string) => {
    if (!address) throw new Error("Dirección inválida");
    await execute(
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
