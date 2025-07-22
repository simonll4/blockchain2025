import { useMetamask } from "@/services/metamask/useMetamask";

import { useCFPFactory } from "@/services/contracts/business/useCFPFactory";
import { useENSRegisterCall } from "@/composables/contracts/ens/useENSRegisterCall";
import { useApiCalls } from "@/composables/api/useApiCalls";

import { normalizeCallName, checkENSAvailability } from "@/utils/ensHelpers";
import { useTxHandler } from "./handlers/useTxHandler";
import { useCallHandler } from "./handlers/useCallHandler";

export function useCreateCallWithENS() {
  const { account } = useMetamask();
  const { createCall, getCall } = useCFPFactory();
  const { registerCall, getOwner, generateCallId } = useENSRegisterCall();
  const txHandler = useTxHandler();
  const callHandler = useCallHandler();

  const reset = () => {
    txHandler.error.value = null;
    txHandler.success.value = false;
    txHandler.message.value = null;
    callHandler.error.value = null;
    callHandler.message.value = null;
    callHandler.result.value = null;
  };

  const createCallWithENS = async (
    callName: string,
    description: string,
    closingTimestamp: number
  ) => {
    reset();
    try {
      // 1. Validar y normalizar nombre ENS
      const parsed = normalizeCallName(callName);
      if (!parsed) {
        txHandler.error.value =
          "Nombre ENS inválido. Solo se permite un subdominio bajo 'llamados.cfp'.";
        return false;
      }
      const { label, fullDomain } = parsed;

      // 2. Chequear disponibilidad ENS
      const ensCheck = await checkENSAvailability(
        fullDomain,
        getOwner,
        account.value!
      );
      if (!ensCheck.available) {
        txHandler.error.value =
          ensCheck.error || "El nombre ENS no está disponible.";
        return false;
      }

      // 3. Crear el contrato CFP (transacción)
      const callId = generateCallId(label);
      const receipt = await txHandler.runTx(
        () => createCall(callId, closingTimestamp),
        "Contrato CFP creado"
      );
      if (!receipt) return false;

      // 4. Obtener la dirección del contrato CFP
      let callInfo;
      try {
        callInfo = await callHandler.runCall(() => getCall(callId));
      } catch (e) {
        return false;
      }
      const cfpAddress = callInfo?.cfp;
      if (
        !cfpAddress ||
        cfpAddress === "0x0000000000000000000000000000000000000000"
      ) {
        txHandler.error.value =
          "La dirección del contrato CFP es inválida o no fue creada correctamente.";
        return false;
      }

      // 5. Registrar en ENS el nombre y la descripción (ya usa runTx internamente)
      const registered = await registerCall(
        label,
        fullDomain,
        cfpAddress,
        description
      );
      console.log("ENS registration result:", registered);
      if (!registered) {
        txHandler.error.value = "No se pudo registrar el llamado en ENS.";
        return false;
      }

   

      txHandler.success.value = true;
      txHandler.message.value = `Llamado \"${fullDomain}\" creado y registrado correctamente.`;
      return true;
    } catch (e: any) {
      txHandler.error.value = e?.message || "Ocurrió un error inesperado.";
      return false;
    }
  };

  return {
    createCallWithENS,
    reset,
    isLoading: txHandler.isLoading,
    error: txHandler.error,
    success: txHandler.success,
    message: txHandler.message,
    callLoading: callHandler.loading,
    callError: callHandler.error,
    callMessage: callHandler.message,
  };
}
