import { useCFPFactory } from "./useCFPFactory";
import { useTxHandler } from "./useTxHandler";

export function useRegisterOnChain() {
  const { register } = useCFPFactory();
  const { isLoading, error, success, message, execute } = useTxHandler();

  const registerUser = async () => {
    await execute(
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
