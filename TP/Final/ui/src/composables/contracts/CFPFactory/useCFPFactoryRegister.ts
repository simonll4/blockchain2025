import { useCFPFactory } from "../../../services/contracts/business/useCFPFactory";
import { useTxHandler } from "../useTxHandler";

export function useCFPFactoryRegister() {
  const { register } = useCFPFactory();
  const { isLoading, error, success, message, runTx } = useTxHandler();

  const registerUser = async () => {
    await runTx(
      () => register(),
      "Registro exitoso en la blockchain"
    );
  };

  return {
    isLoading,
    error,
    success,
    message,
    register: registerUser,
  };
}
