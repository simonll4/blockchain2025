// src/composables/useVerifyProposal.ts
import { ref } from "vue";
import { ProposalService } from "@/services/apiClient";
import { USER_ERRORS } from "@/utils/apiErrors";
import { calculateFileHash } from "@/utils/ethersUtils";

// Mensajes de error que corresponden al usuario
// const USER_ERRORS = {
//   ALREADY_REGISTERED: "La propuesta ya ha sido registrada",
//   UNAUTHORIZED: "No autorizado",
//   PROPOSAL_NOT_FOUND: "La propuesta no existe",
// };

export function useVerifyProposal(callId: string) {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const message = ref<string | null>(null);
  const success = ref(false);
  const proposalData = ref<any>(null);

  const validateFile = (file: File) => {
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      return "Solo se permiten archivos PDF o Word";
    }
    if (file.size > maxSize) {
      return "El archivo no debe exceder los 5MB";
    }
    return true;
  };

  const verifyProposal = async (file: File) => {
    isLoading.value = true;
    error.value = null;
    message.value = null;
    success.value = false;
    proposalData.value = null;

    try {
      // Validar archivo
      //   const validation = validateFile(file);
      //   if (validation !== true) {
      //     throw new Error(validation);
      //   }

      // Calcular hash
      const proposalHash = await calculateFileHash(file);
      // Verificar en backend
      const response = await ProposalService.getData(callId, proposalHash);

      message.value = "Propuesta verificada y encontrada en el sistema";
      success.value = true;
      proposalData.value = response.data;
    } catch (err: any) {
      const apiError = err.response?.data?.message;

      if (apiError && Object.values(USER_ERRORS).includes(apiError)) {
        error.value = apiError;
        message.value = apiError;
      } else {
        error.value = "Error al registrar la propuesta";
        message.value =
          "Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde.";
      }
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    error,
    message,
    success,
    proposalData,
    verifyProposal,
  };
}
